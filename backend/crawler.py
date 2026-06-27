"""
UXVerse AI — Playwright BFS Crawler
Crawls every reachable internal page using Breadth-First Search.
Falls back to requests+BeautifulSoup when Playwright is unavailable.
"""
import asyncio
import base64
import logging
import re
import time
import urllib.parse
from typing import Any, Callable, Dict, List, Optional, Set

import requests as req_lib
from bs4 import BeautifulSoup

logger = logging.getLogger("uxverse.crawler")

SKIP_PATTERNS = re.compile(
    r"(/logout|/signout|/sign-out|/log-out|/delete-account"
    r"|\.(pdf|doc|docx|xls|xlsx|zip|tar|gz|exe|dmg|pkg"
    r"|mp4|mp3|wav|ogg|webm|jpg|jpeg|png|gif|webp|svg|ico"
    r"|css|js|woff|woff2|ttf|eot|map)$"
    r"|#|javascript:|mailto:|tel:|ftp:|data:)",
    re.IGNORECASE,
)


# ─── Helpers ──────────────────────────────────────────────────────────────────

def normalize_url(url: str, base: str) -> Optional[str]:
    try:
        full = urllib.parse.urljoin(base, url)
        p = urllib.parse.urlparse(full)
        # Strip fragment, strip trailing slash (for dedup), keep query only for non-hash links
        clean = urllib.parse.urlunparse((p.scheme, p.netloc, p.path.rstrip("/") or "/", "", p.query, ""))
        return clean
    except Exception:
        return None


def is_internal(url: str, base_netloc: str) -> bool:
    try:
        p = urllib.parse.urlparse(url)
        return p.netloc == base_netloc or p.netloc == "" or p.netloc.endswith("." + base_netloc)
    except Exception:
        return False


def get_path(url: str) -> str:
    try:
        p = urllib.parse.urlparse(url)
        path = p.path or "/"
        return path
    except Exception:
        return "/"


def get_parent_path(path: str) -> str:
    if path in ("/", ""):
        return ""
    parts = path.rstrip("/").rsplit("/", 1)
    return parts[0] if parts[0] else "/"


def extract_dom_info(soup: BeautifulSoup) -> Dict[str, Any]:
    """Extract structured DOM information for agent analysis."""
    labels = {lbl.get("for"): lbl.get_text(strip=True) for lbl in soup.find_all("label") if lbl.get("for")}
    inputs = []
    for inp in soup.find_all(["input", "select", "textarea"])[:25]:
        inp_id = inp.get("id")
        inputs.append({
            "type": inp.get("type", "text"),
            "id": inp_id,
            "name": inp.get("name"),
            "label": labels.get(inp_id),
            "aria_label": inp.get("aria-label"),
            "placeholder": inp.get("placeholder"),
            "required": inp.has_attr("required"),
        })

    return {
        "images": [
            {"src": img.get("src", "")[:100], "alt": img.get("alt"), "has_alt": img.has_attr("alt")}
            for img in soup.find_all("img")[:30]
        ],
        "buttons": [
            {"text": btn.get_text(strip=True)[:60], "aria_label": btn.get("aria-label"), "type": btn.get("type")}
            for btn in soup.find_all("button")[:25]
        ],
        "inputs": inputs,
        "headings": [
            {"tag": h.name, "text": h.get_text(strip=True)[:120]}
            for h in soup.find_all(["h1", "h2", "h3", "h4", "h5", "h6"])
        ],
        "links": len(soup.find_all("a")),
        "forms": len(soup.find_all("form")),
        "nav_elements": len(soup.find_all("nav")),
        "has_skip_link": bool(
            soup.find("a", href=re.compile(r"#main|#content|#skip", re.I))
            or soup.find("a", string=re.compile(r"skip", re.I))
        ),
        "has_lang_attr": bool(soup.find("html", lang=True)),
        "has_main_landmark": bool(soup.find("main") or soup.find(attrs={"role": "main"})),
        "html_lang": (soup.find("html") or {}).get("lang", "") if soup.find("html") else "",
        "duplicate_ids": _find_duplicate_ids(soup),
    }


def _find_duplicate_ids(soup: BeautifulSoup) -> List[str]:
    ids = [tag.get("id") for tag in soup.find_all(id=True)]
    seen: Set[str] = set()
    dupes: List[str] = []
    for id_val in ids:
        if id_val in seen:
            dupes.append(id_val)
        seen.add(id_val)
    return dupes[:5]


# ─── Playwright Crawler ───────────────────────────────────────────────────────

async def _playwright_crawl(
    start_url: str,
    max_pages: int,
    max_depth: int,
    progress_callback: Optional[Callable],
) -> List[Dict[str, Any]]:
    from playwright.async_api import async_playwright

    parsed = urllib.parse.urlparse(start_url)
    base_netloc = parsed.netloc
    visited: Set[str] = set()
    pages_data: List[Dict[str, Any]] = []

    # BFS queue: (url, depth, parent_path)
    queue: List[tuple] = [(start_url, 0, "")]

    async with async_playwright() as p:
        browser = await p.chromium.launch(
            headless=True,
            args=["--no-sandbox", "--disable-dev-shm-usage", "--disable-gpu", "--disable-extensions"],
        )
        context = await browser.new_context(
            viewport={"width": 1280, "height": 800},
            user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 UXVerseAI/1.0",
            ignore_https_errors=True,
        )

        try:
            while queue and len(pages_data) < max_pages:
                current_url, depth, parent_path = queue.pop(0)

                norm = normalize_url(current_url, start_url)
                if not norm or norm in visited:
                    continue
                if depth > max_depth:
                    continue
                if SKIP_PATTERNS.search(current_url):
                    continue

                visited.add(norm)
                path = get_path(norm)
                computed_parent = get_parent_path(path) if depth > 0 else ""

                discovered = len(queue) + len(pages_data) + 1
                if progress_callback:
                    await progress_callback(
                        current_page=norm,
                        discovered_count=discovered,
                        completed_count=len(pages_data),
                        agent="Explorer Agent — Crawling pages with Playwright",
                    )

                page = await context.new_page()
                html, title, screenshot_b64, dom_info = "", path, None, {}

                try:
                    response = await page.goto(norm, wait_until="domcontentloaded", timeout=15_000)
                    if response and response.status >= 400:
                        logger.info(f"Skip {norm} → HTTP {response.status}")
                        await page.close()
                        continue

                    await page.wait_for_timeout(600)

                    title = await page.title() or path
                    html = await page.content()

                    # Screenshot
                    try:
                        ss_bytes = await page.screenshot(type="jpeg", quality=55, full_page=False)
                        screenshot_b64 = base64.b64encode(ss_bytes).decode("utf-8")
                    except Exception as e:
                        logger.debug(f"Screenshot failed {norm}: {e}")

                    # Extract links via JS (captures dynamic links too)
                    hrefs: List[str] = await page.evaluate(
                        "() => Array.from(document.querySelectorAll('a[href]')).map(a=>a.href)"
                    )
                    for href in hrefs:
                        norm_link = normalize_url(href, norm)
                        if (
                            norm_link
                            and norm_link not in visited
                            and is_internal(norm_link, base_netloc)
                            and not SKIP_PATTERNS.search(norm_link)
                            and norm_link not in [q[0] for q in queue]
                        ):
                            queue.append((norm_link, depth + 1, path))

                except asyncio.TimeoutError:
                    logger.warning(f"Timeout: {norm}")
                except Exception as e:
                    logger.error(f"Page error {norm}: {e}")
                finally:
                    await page.close()

                if html:
                    soup = BeautifulSoup(html, "html.parser")
                    dom_info = extract_dom_info(soup)
                    title = title or soup.find("title", text=True) or path

                pages_data.append({
                    "url": norm,
                    "path": path,
                    "parent_path": computed_parent,
                    "title": title,
                    "html": html,
                    "screenshot_b64": screenshot_b64,
                    "dom_info": dom_info,
                    "depth": depth,
                })

        finally:
            await context.close()
            await browser.close()

    logger.info(f"Playwright crawl complete: {len(pages_data)} pages")
    return pages_data


# ─── Requests Fallback Crawler ────────────────────────────────────────────────

async def _requests_crawl(
    start_url: str,
    max_pages: int,
    max_depth: int,
    progress_callback: Optional[Callable],
) -> List[Dict[str, Any]]:
    parsed = urllib.parse.urlparse(start_url)
    base_netloc = parsed.netloc
    visited: Set[str] = set()
    pages_data: List[Dict[str, Any]] = []
    queue: List[tuple] = [(start_url, 0, "")]

    session = req_lib.Session()
    session.headers.update({"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) UXVerseAI/1.0"})

    while queue and len(pages_data) < max_pages:
        current_url, depth, parent_path = queue.pop(0)
        norm = normalize_url(current_url, start_url)
        if not norm or norm in visited:
            continue
        if depth > max_depth:
            continue
        if SKIP_PATTERNS.search(current_url):
            continue

        visited.add(norm)
        path = get_path(norm)
        computed_parent = get_parent_path(path) if depth > 0 else ""

        if progress_callback:
            await progress_callback(
                current_page=norm,
                discovered_count=len(queue) + len(pages_data) + 1,
                completed_count=len(pages_data),
                agent="Explorer Agent — Crawling pages (requests mode)",
            )

        html, title, dom_info = "", path, {}
        try:
            resp = session.get(norm, timeout=10, allow_redirects=True)
            if resp.status_code >= 400:
                continue
            html = resp.text
            soup = BeautifulSoup(html, "html.parser")
            title_tag = soup.find("title")
            title = title_tag.get_text(strip=True) if title_tag else path
            dom_info = extract_dom_info(soup)

            for a in soup.find_all("a", href=True):
                nl = normalize_url(a["href"], norm)
                if nl and nl not in visited and is_internal(nl, base_netloc) and not SKIP_PATTERNS.search(nl):
                    if nl not in [q[0] for q in queue]:
                        queue.append((nl, depth + 1, path))

            time.sleep(0.25)  # polite delay

        except Exception as e:
            logger.error(f"requests crawl error {norm}: {e}")

        pages_data.append({
            "url": norm,
            "path": path,
            "parent_path": computed_parent,
            "title": title,
            "html": html,
            "screenshot_b64": None,
            "dom_info": dom_info,
            "depth": depth,
        })

    logger.info(f"Requests crawl complete: {len(pages_data)} pages")
    return pages_data


# ─── Public API ───────────────────────────────────────────────────────────────

async def crawl_async(
    start_url: str,
    max_pages: int = 15,
    max_depth: int = 3,
    progress_callback: Optional[Callable] = None,
) -> List[Dict[str, Any]]:
    """Crawl start_url using Playwright; fall back to requests if unavailable."""
    try:
        import playwright  # noqa
        pages = await _playwright_crawl(start_url, max_pages, max_depth, progress_callback)
        if not pages:
            raise RuntimeError("Playwright returned 0 pages")
        return pages
    except Exception as e:
        logger.warning(f"Playwright unavailable ({e}), falling back to requests")
        return await _requests_crawl(start_url, max_pages, max_depth, progress_callback)


def crawl_sync(
    start_url: str,
    max_pages: int = 15,
    progress_callback: Optional[Callable] = None,
) -> List[Dict[str, Any]]:
    """Synchronous wrapper for crawl_async."""
    async def _run():
        return await crawl_async(start_url, max_pages=max_pages, progress_callback=progress_callback)

    loop = asyncio.new_event_loop()
    try:
        asyncio.set_event_loop(loop)
        return loop.run_until_complete(_run())
    finally:
        loop.close()
