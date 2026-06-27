"""
UXVerse AI — Playwright BFS Professional Web Crawler
Acts like Screaming Frog / Sitebulb. Fully explores website directories and dynamic pages.
Discovers links from robots.txt, sitemaps, DOM elements, dropdown menus, mega menus, hamburger clicks, and hovers.
"""
import asyncio
import base64
import logging
import os
import re
import time
import urllib.parse
from typing import Any, Callable, Dict, List, Optional, Set

import requests as req_lib
from bs4 import BeautifulSoup

logger = logging.getLogger("uxverse.crawler")


# ─── URL Normalization & Filtering Helpers ────────────────────────────────────

def normalize_url(url: str, base: str) -> Optional[str]:
    """
    Normalizes URLs by resolving relative paths, removing fragments,
    cleaning trailing slashes, stripping tracking queries, and sorting arguments.
    """
    try:
        full = urllib.parse.urljoin(base, url)
        p = urllib.parse.urlparse(full)
        
        # Clean path: strip trailing slashes (except root)
        path = p.path.rstrip("/") or "/"
        
        cleaned_query = ""
        if p.query:
            params = urllib.parse.parse_qsl(p.query)
            ignore_keys = {
                "page", "p", "sort", "orderby", "order", "filter", 
                "category", "cat", "tag", "date", "month", "year", "day"
            }
            cleaned_params = []
            for k, v in params:
                kl = k.lower()
                if kl.startswith("utm_") or kl in ignore_keys:
                    continue
                cleaned_params.append((k, v))
            if cleaned_params:
                cleaned_params.sort(key=lambda x: x[0])
                cleaned_query = urllib.parse.urlencode(cleaned_params)

        netloc = p.netloc.lower()
        clean = urllib.parse.urlunparse((p.scheme, netloc, path, "", cleaned_query, ""))
        return clean
    except Exception:
        return None


def is_internal(url: str, base_netloc: str) -> bool:
    try:
        p = urllib.parse.urlparse(url)
        netloc = p.netloc.lower()
        base = base_netloc.lower()
        return netloc == base or netloc == "" or netloc.endswith("." + base)
    except Exception:
        return False


def should_ignore_url(url: str, start_url: str, base_netloc: str) -> bool:
    """Ignore criteria: external sites, asset extensions, API paths, and standard static routes."""
    try:
        norm = normalize_url(url, start_url)
        if not norm:
            return True
            
        p = urllib.parse.urlparse(norm)
        if not is_internal(norm, base_netloc):
            return True
            
        path = p.path or "/"
        path_lower = path.lower().rstrip("/")
        if not path_lower:
            path_lower = "/"
            
        start_p = urllib.parse.urlparse(start_url)
        start_path_norm = start_p.path.lower().rstrip("/") or "/"
        if path_lower == start_path_norm:
            return False

        asset_exts = {
            ".png", ".jpg", ".jpeg", ".svg", ".gif", ".css", ".js", ".woff", ".woff2", ".ico", ".pdf", ".zip",
            ".doc", ".docx", ".xls", ".xlsx", ".tar", ".gz", ".exe", ".dmg", ".pkg", ".mp4", ".mp3", ".wav", ".ogg",
            ".webm", ".webp", ".map", ".xml", ".json", ".txt"
        }
        _, ext = os.path.splitext(path.lower())
        if ext in asset_exts:
            return True
            
        if path_lower.startswith("/api") or "/api/" in path_lower or path_lower in ("/graphql", "/rpc"):
            return True
            
        framework_prefixes = ("/_next", "/static", "/assets", "/build", "/dist")
        for pref in framework_prefixes:
            if path_lower.startswith(pref) or f"/{pref.lstrip('/')}/" in path_lower:
                return True
                
        auth_routes = ("/login", "/logout", "/signin", "/signup", "/register", "/forgot-password", "/sign-out", "/log-out", "/delete-account")
        for auth in auth_routes:
            if path_lower.endswith(auth) or f"{auth}/" in path_lower:
                return True

        calendar_patterns = [
            r"/\d{4}/\d{2}/\d{2}",  # /2026/06/27
            r"/\d{4}/\d{2}",        # /2026/06
            r"\d{4}-\d{2}-\d{2}",   # 2026-06-27
            r"\d{4}-\d{2}",         # 2026-06
            r"/calendar",           # /calendar
            r"/event/\d{4}",
        ]
        for pattern in calendar_patterns:
            if re.search(pattern, path_lower):
                return True

        return False
    except Exception:
        return True


def get_path(url: str) -> str:
    try:
        p = urllib.parse.urlparse(url)
        return p.path or "/"
    except Exception:
        return "/"


def get_parent_path(path: str) -> str:
    if path in ("/", ""):
        return ""
    parts = path.rstrip("/").rsplit("/", 1)
    return parts[0] if parts[0] else "/"


# ─── Robots.txt & Sitemap URL Discovery ───────────────────────────────────────

def try_get_robots_txt_sitemaps(start_url: str) -> Set[str]:
    """Parse robots.txt to discover Sitemap XML files."""
    sitemaps = set()
    try:
        parsed = urllib.parse.urlparse(start_url)
        robots_url = f"{parsed.scheme}://{parsed.netloc}/robots.txt"
        resp = req_lib.get(robots_url, timeout=5)
        if resp.status_code == 200:
            for line in resp.text.split("\n"):
                if line.lower().startswith("sitemap:"):
                    parts = line.split(":", 1)
                    if len(parts) > 1:
                        sitemaps.add(parts[1].strip())
    except Exception as e:
        logger.debug(f"robots.txt parse failed/skipped: {e}")
    return sitemaps


def try_get_sitemap_urls(start_url: str, base_netloc: str) -> Set[str]:
    """Optionally fetch urls from default /sitemap.xml location."""
    parsed = urllib.parse.urlparse(start_url)
    default_sitemap = f"{parsed.scheme}://{parsed.netloc}/sitemap.xml"
    return parse_sitemap_xml(default_sitemap, base_netloc)


def parse_sitemap_xml(sitemap_url: str, base_netloc: str) -> Set[str]:
    urls = set()
    try:
        resp = req_lib.get(sitemap_url, timeout=5)
        if resp.status_code == 200:
            soup = BeautifulSoup(resp.text, "xml")
            for loc in soup.find_all("loc"):
                val = loc.get_text(strip=True)
                if val and is_internal(val, base_netloc) and not should_ignore_url(val, sitemap_url, base_netloc):
                    urls.add(val)
            logger.info(f"Discovered {len(urls)} URLs from sitemap {sitemap_url}")
    except Exception as e:
        logger.debug(f"Sitemap parse failed/skipped for {sitemap_url}: {e}")
    return urls


# ─── Deduplication ────────────────────────────────────────────────────────────

def deduplicate_pages(pages: List[Dict[str, Any]], base_netloc: str) -> List[Dict[str, Any]]:
    """
    Deduplicates pages using normalized URL comparison to keep unique page paths
    regardless of relative/absolute canonical redirects.
    """
    unique_pages = []
    seen_urls = set()
    for page in pages:
        url = page.get("url")
        if not url:
            continue
        if url not in seen_urls:
            seen_urls.add(url)
            unique_pages.append(page)
    logger.info(f"Final unique canonical pages: {len(unique_pages)} (deduplicated from {len(pages)})")
    return unique_pages


# ─── Structured DOM Information Extractor ────────────────────────────────────

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

    meta_desc_tag = soup.find("meta", attrs={"name": "description"})
    meta_desc = meta_desc_tag.get("content", "") if meta_desc_tag else ""

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
        "meta_description": meta_desc
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


# ─── Playwright Professional Crawler (Dynamic Actions + BFS) ──────────────────

async def _playwright_crawl(
    start_url: str,
    max_pages: int,
    max_depth: int,
    progress_callback: Optional[Callable],
) -> List[Dict[str, Any]]:
    from playwright.async_api import async_playwright

    parsed = urllib.parse.urlparse(start_url)
    base_netloc = parsed.netloc
    
    # 1. Discover seed URLs from robots.txt and sitemap.xml
    discovered_seeds = set()
    sitemaps = try_get_robots_txt_sitemaps(start_url)
    for sm in sitemaps:
        discovered_seeds.update(parse_sitemap_xml(sm, base_netloc))
    discovered_seeds.update(try_get_sitemap_urls(start_url, base_netloc))
    
    visited: Set[str] = set()
    pages_data: List[Dict[str, Any]] = []

    # BFS Queue: (url, depth, parent_path)
    queue: List[tuple] = [(start_url, 0, "")]
    for seed in sorted(discovered_seeds):
        norm_seed = normalize_url(seed, start_url)
        if norm_seed and is_internal(norm_seed, base_netloc) and not should_ignore_url(norm_seed, start_url, base_netloc):
            queue.append((norm_seed, 1, ""))

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
                if should_ignore_url(current_url, start_url, base_netloc):
                    continue

                visited.add(norm)
                path = get_path(norm)
                computed_parent = get_parent_path(path) if depth > 0 else ""

                discovered_count = len(visited) + len(queue)
                if progress_callback:
                    await progress_callback(
                        current_page=norm,
                        discovered_count=discovered_count,
                        completed_count=len(pages_data),
                        agent="Explorer Agent — Crawling website subpages with Playwright",
                    )

                page = await context.new_page()
                html, title, screenshot_b64, dom_info, canonical_url = "", path, None, {}, None

                try:
                    response = await page.goto(norm, wait_until="domcontentloaded", timeout=15_000)
                    if response and response.status >= 400:
                        logger.info(f"Skip {norm} → HTTP {response.status}")
                        await page.close()
                        continue

                    # Wait for network idle
                    try:
                        await page.wait_for_load_state("networkidle", timeout=4000)
                    except Exception:
                        pass

                    # 1. Scroll smoothly to trigger lazy loading
                    await page.evaluate('''async () => {
                        await new Promise((resolve) => {
                            let totalHeight = 0;
                            const distance = 120;
                            const timer = setInterval(() => {
                                const scrollHeight = document.body.scrollHeight;
                                window.scrollBy(0, distance);
                                totalHeight += distance;
                                if (totalHeight >= scrollHeight || totalHeight > 10000) {
                                    clearInterval(timer);
                                    resolve();
                                }
                            }, 40);
                        });
                    }''')

                    # 2. Hover elements matching dropdown/nav/menu triggers
                    await page.evaluate('''() => {
                        const hovers = document.querySelectorAll(
                            'a[class*="menu" i], a[class*="dropdown" i], li[class*="dropdown" i], div[class*="dropdown" i], [role="menuitem"], [class*="nav" i] a'
                        );
                        for (const el of hovers) {
                            try {
                                const ev = new MouseEvent("mouseover", { bubbles: true, cancelable: true, view: window });
                                el.dispatchEvent(ev);
                            } catch(e) {}
                        }
                    }''')

                    # 3. Click hamburger menus / expand buttons
                    await page.evaluate('''() => {
                        const toggles = document.querySelectorAll(
                            'button[aria-expanded="false"], [class*="hamburger" i], [class*="menu-toggle" i], [class*="nav-toggle" i]'
                        );
                        for (const t of toggles) {
                            try {
                                if (t.click) t.click();
                            } catch(e) {}
                        }
                    }''')

                    await page.wait_for_timeout(1000)

                    title = await page.title() or path
                    html = await page.content()

                    # Extract canonical URL
                    canonical_href = await page.evaluate(
                        "() => { const link = document.querySelector('link[rel=\"canonical\"]'); return link ? link.href : null; }"
                    )
                    if canonical_href:
                        canonical_url = normalize_url(canonical_href, norm)

                    # Extract meta description
                    meta_desc = await page.evaluate('''() => {
                        const meta = document.querySelector('meta[name="description"]');
                        return meta ? meta.content : "";
                    }''')

                    # Bounding Box / Capture Full-page Screenshot
                    try:
                        ss_bytes = await page.screenshot(type="jpeg", quality=45, full_page=True)
                        screenshot_b64 = base64.b64encode(ss_bytes).decode("utf-8")
                    except Exception:
                        try:
                            ss_bytes = await page.screenshot(type="jpeg", quality=45, full_page=False)
                            screenshot_b64 = base64.b64encode(ss_bytes).decode("utf-8")
                        except Exception:
                            screenshot_b64 = None

                    # Extract navigation and page links
                    hrefs: List[str] = await page.evaluate(
                        "() => Array.from(document.querySelectorAll('a[href]')).map(a=>a.href)"
                    )
                    nav_hrefs: List[str] = await page.evaluate('''() => {
                        const links = document.querySelectorAll('nav a[href], footer a[href], header a[href], .sidebar a[href]');
                        return Array.from(links).map(el => el.href);
                    }''')

                    for href in set(hrefs + nav_hrefs):
                        norm_link = normalize_url(href, norm)
                        if (
                            norm_link
                            and norm_link not in visited
                            and is_internal(norm_link, base_netloc)
                            and not should_ignore_url(norm_link, start_url, base_netloc)
                            and norm_link not in [q[0] for q in queue]
                        ):
                            queue.append((norm_link, depth + 1, path))

                    soup = BeautifulSoup(html, "html.parser")
                    dom_info = extract_dom_info(soup)
                    dom_info["meta_description"] = meta_desc
                    dom_info["canonical_url"] = canonical_url or norm

                    pages_data.append({
                        "url": norm,
                        "canonical_url": canonical_url or norm,
                        "path": path,
                        "parent_path": computed_parent,
                        "title": title,
                        "html": html,
                        "screenshot_b64": screenshot_b64,
                        "dom_info": dom_info,
                        "depth": depth,
                    })

                except Exception as e:
                    logger.error(f"Error crawling page {norm}: {e}")
                finally:
                    await page.close()

        except Exception as e:
            logger.error(f"Playwright loop failure: {e}")
        finally:
            await browser.close()

    return deduplicate_pages(pages_data, base_netloc)


# ─── Requests Fallback Crawler (BFS) ──────────────────────────────────────────

async def _requests_crawl(
    start_url: str,
    max_pages: int,
    max_depth: int,
    progress_callback: Optional[Callable],
) -> List[Dict[str, Any]]:
    parsed = urllib.parse.urlparse(start_url)
    base_netloc = parsed.netloc
    
    discovered_seeds = set()
    sitemaps = try_get_robots_txt_sitemaps(start_url)
    for sm in sitemaps:
        discovered_seeds.update(parse_sitemap_xml(sm, base_netloc))
    discovered_seeds.update(try_get_sitemap_urls(start_url, base_netloc))
    
    visited: Set[str] = set()
    pages_data: List[Dict[str, Any]] = []
    
    queue: List[tuple] = [(start_url, 0, "")]
    for seed in sorted(discovered_seeds):
        norm_seed = normalize_url(seed, start_url)
        if norm_seed and is_internal(norm_seed, base_netloc) and not should_ignore_url(norm_seed, start_url, base_netloc):
            queue.append((norm_seed, 1, ""))

    session = req_lib.Session()
    session.headers.update({"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) UXVerseAI/1.0"})

    while queue and len(pages_data) < max_pages:
        current_url, depth, parent_path = queue.pop(0)
        norm = normalize_url(current_url, start_url)
        if not norm or norm in visited:
            continue
        if depth > max_depth:
            continue
        if should_ignore_url(current_url, start_url, base_netloc):
            continue

        visited.add(norm)
        path = get_path(norm)
        computed_parent = get_parent_path(path) if depth > 0 else ""

        discovered_count = len(visited) + len(queue)
        if progress_callback:
            await progress_callback(
                current_page=norm,
                discovered_count=discovered_count,
                completed_count=len(pages_data),
                agent="Explorer Agent — Crawling unique pages (requests mode)",
            )

        html, title, dom_info, canonical_url = "", path, {}, None
        try:
            resp = session.get(norm, timeout=10, allow_redirects=True)
            if resp.status_code >= 400:
                continue
            html = resp.text
            soup = BeautifulSoup(html, "html.parser")
            title_tag = soup.find("title")
            title = title_tag.get_text(strip=True) if title_tag else path
            dom_info = extract_dom_info(soup)

            canonical_tag = soup.find("link", rel="canonical")
            canonical_href = canonical_tag.get("href") if canonical_tag else None
            if canonical_href:
                canonical_url = normalize_url(canonical_href, norm)

            for a in soup.find_all("a", href=True):
                nl = normalize_url(a["href"], norm)
                if (
                    nl 
                    and nl not in visited 
                    and is_internal(nl, base_netloc) 
                    and not should_ignore_url(nl, start_url, base_netloc)
                ):
                    if nl not in [q[0] for q in queue]:
                        queue.append((nl, depth + 1, path))

            time.sleep(0.2)

        except Exception as e:
            logger.error(f"requests crawl error {norm}: {e}")

        pages_data.append({
            "url": norm,
            "canonical_url": canonical_url or norm,
            "path": path,
            "parent_path": computed_parent,
            "title": title,
            "html": html,
            "screenshot_b64": None,
            "dom_info": dom_info,
            "depth": depth,
        })

    return deduplicate_pages(pages_data, base_netloc)


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
