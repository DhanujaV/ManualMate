"""
UXVerse AI — FastAPI Backend
Provides REST and WebSocket endpoints for the full audit pipeline.
"""
import asyncio
import json
import logging
import uuid
from typing import Optional

from fastapi import FastAPI, HTTPException, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from backend.database import db
from backend.models import AuditStartRequest, CoachChatRequest, GenerateFixRequest
from backend.orchestrator import AuditOrchestrator
from backend.agents.improvement_agent import ImprovementAgent

_improvement_agent = ImprovementAgent()

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(name)s %(levelname)s %(message)s")
logger = logging.getLogger("uxverse.main")

app = FastAPI(
    title="UXVerse AI",
    version="2.0.0",
    description="AI-powered autonomous UX audit platform — production pipeline",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Active audit queues — audit_id → asyncio.Queue of progress events
_audit_queues: dict[str, asyncio.Queue] = {}
# Completed audit results cache (in-memory, also in DB)
_audit_results: dict[str, dict] = {}


# ─── REST Endpoints ────────────────────────────────────────────────────────────

@app.get("/")
def root():
    return {"message": "UXVerse AI v2.0 — production pipeline running. See /docs for API."}


@app.post("/api/audit/start")
async def start_audit(request: AuditStartRequest):
    """
    Start a new crawl-and-audit job.
    Returns audit_id for WebSocket subscription and status polling.
    """
    url = request.url.strip()
    if not url.startswith(("http://", "https://")):
        url = "https://" + url

    audit_id = f"audit-{uuid.uuid4().hex[:10]}"
    q: asyncio.Queue = asyncio.Queue(maxsize=200)
    _audit_queues[audit_id] = q

    async def _run():
        try:
            orchestrator = AuditOrchestrator(audit_id=audit_id, url=url, event_queue=q)
            result = await orchestrator.run()
            _audit_results[audit_id] = result
        except Exception as exc:
            logger.error(f"Audit {audit_id} failed: {exc}", exc_info=True)
            # Error already emitted inside orchestrator
        finally:
            # Signal WebSocket consumers that stream is done
            try:
                q.put_nowait({"type": "__done__"})
            except asyncio.QueueFull:
                pass

    asyncio.create_task(_run())
    logger.info(f"Started audit {audit_id} for {url}")
    return {"audit_id": audit_id, "status": "started", "url": url}


@app.get("/api/audit/{audit_id}")
def get_audit(audit_id: str):
    """Return completed audit result."""
    # Check in-memory cache first
    if audit_id in _audit_results:
        return _audit_results[audit_id]
    # Try database
    audit = db.get_audit(audit_id)
    if not audit:
        raise HTTPException(status_code=404, detail=f"Audit '{audit_id}' not found.")
    return audit


@app.get("/api/audits")
def list_audits():
    """List all stored audits (for Progress Tracker)."""
    return db.list_audits()


@app.post("/api/fixes/generate")
async def generate_fix(request: GenerateFixRequest):
    """
    Generates a focused before/after code fix for a specific issue on a page.
    Looks up the page HTML from stored audit results and runs the ImprovementAgent
    on the single target issue.
    """
    page_url = request.url
    issue_id = request.issue_id

    # Search all cached audit results for a page matching the URL
    target_page = None
    target_issue = None

    for audit_result in _audit_results.values():
        for page in audit_result.get("pages", []):
            if page.get("url") == page_url:
                target_page = page
                break
        if target_page:
            break

    # Fallback: search the database
    if not target_page:
        all_audits = db.list_audits()
        for audit_record in all_audits:
            for page in audit_record.get("pages", []):
                if page.get("url") == page_url:
                    target_page = page
                    break
            if target_page:
                break

    if not target_page:
        raise HTTPException(status_code=404, detail=f"No audit data found for URL: {page_url}")

    # Find the specific issue by ID across ux and a11y issues
    all_page_issues = target_page.get("uxIssues", []) + target_page.get("a11yIssues", [])
    for issue in all_page_issues:
        if issue.get("id") == issue_id:
            target_issue = issue
            break

    if not target_issue:
        raise HTTPException(status_code=404, detail=f"Issue '{issue_id}' not found on page {page_url}")

    # Generate the before/after fix using the improvement agent
    ux_issues = [target_issue] if target_issue in target_page.get("uxIssues", []) else []
    a11y_issues = [target_issue] if target_issue in target_page.get("a11yIssues", []) else []
    if not ux_issues and not a11y_issues:
        # If we couldn't classify, treat as ux issue
        ux_issues = [target_issue]

    before_after = _improvement_agent.generate(
        page_url=page_url,
        html=target_page.get("html", ""),
        ux_issues=ux_issues,
        a11y_issues=a11y_issues,
    )

    # Return structured before/after for the matching issue
    matching_fix = None
    for fix in before_after.get("issues", []):
        if fix.get("id") == issue_id:
            matching_fix = fix
            break

    if not matching_fix and before_after.get("issues"):
        matching_fix = before_after["issues"][0]

    if not matching_fix:
        raise HTTPException(status_code=422, detail="Could not generate a fix for this issue.")

    return {
        "issue_id": issue_id,
        "page_url": page_url,
        "before": {
            "html": matching_fix.get("before_html", ""),
        },
        "after": {
            "html": matching_fix.get("after_html", ""),
            "css": matching_fix.get("after_css", ""),
            "visual": matching_fix.get("ux_fix_explanation", ""),
        },
        "reasoning": matching_fix.get("ux_fix_explanation", ""),
        "accessibility_notes": matching_fix.get("accessibility_fix_notes", ""),
        "severity": target_issue.get("severity", "Warning"),
        "title": matching_fix.get("title", ""),
    }


@app.post("/api/coach/chat")
async def coach_chat(request: CoachChatRequest):
    """
    AI UX Coach — answers using real audit context.
    Tries Ollama locally first; falls back to a structured expert response.
    """
    message = request.message
    audit_ctx = request.audit_context or {}

    # Build rich context string from audit data
    context_lines = []
    if audit_ctx.get("url"):
        context_lines.append(f"Audited website: {audit_ctx['url']}")
    if audit_ctx.get("uxScore"):
        context_lines.append(f"UX Score: {audit_ctx['uxScore']}/100, Accessibility Score: {audit_ctx['a11yScore']}/100")
    if audit_ctx.get("criticalCount"):
        context_lines.append(f"Critical issues: {audit_ctx['criticalCount']}, Warnings: {audit_ctx['warningCount']}")
    if audit_ctx.get("topIssues"):
        context_lines.append("Top issues:\n" + "\n".join(f"  - {i}" for i in audit_ctx["topIssues"][:3]))

    context_str = "\n".join(context_lines)

    system_prompt = (
        "You are a senior UX consultant and WCAG 2.2 accessibility specialist. "
        "You deeply know Nielsen's 10 Usability Heuristics and can generate production-ready HTML/CSS fixes. "
        "Always ground your answers in the audit data when available. "
        "When generating code, use modern Tailwind CSS or plain CSS as appropriate.\n\n"
        f"Audit Context:\n{context_str}"
    )

    # Try Ollama (local LLM)
    try:
        import requests as req
        payload = {
            "model": "gemma2:2b",
            "prompt": f"{system_prompt}\n\nUser question: {message}\n\nExpert UX answer:",
            "stream": False,
            "options": {"temperature": 0.65, "num_predict": 500},
        }
        resp = req.post("http://localhost:11434/api/generate", json=payload, timeout=8)
        if resp.status_code == 200:
            reply = resp.json().get("response", "").strip()
            if reply:
                code_blocks = _extract_code_blocks(reply)
                return {"reply": reply, "codeBlocks": code_blocks}
    except Exception as e:
        logger.info(f"Ollama unavailable: {e}")

    # Structured expert fallback based on message keywords
    reply = _structured_coach_reply(message, audit_ctx)
    code_blocks = _extract_code_blocks(reply)
    return {"reply": reply, "codeBlocks": code_blocks}


@app.get("/api/audit/{audit_id}/status")
def audit_status(audit_id: str):
    """Legacy polling endpoint for audit status."""
    if audit_id in _audit_results:
        return {"status": "completed", "audit_id": audit_id}
    if audit_id in _audit_queues:
        return {"status": "running", "audit_id": audit_id}
    return {"status": "not_found", "audit_id": audit_id}


# ─── WebSocket Endpoint ────────────────────────────────────────────────────────

@app.websocket("/ws/audit/{audit_id}")
async def audit_websocket(websocket: WebSocket, audit_id: str):
    """
    Stream real-time audit progress events to the frontend.
    Sends JSON objects matching the ProgressEvent model.
    Closes automatically when the audit completes or errors.
    """
    await websocket.accept()
    logger.info(f"WebSocket connected for audit {audit_id}")

    # Wait up to 5s for queue to be created (handles race with POST)
    for _ in range(50):
        if audit_id in _audit_queues:
            break
        await asyncio.sleep(0.1)

    if audit_id not in _audit_queues:
        await websocket.send_json({"type": "error", "error": f"Audit {audit_id} not found."})
        await websocket.close()
        return

    q = _audit_queues[audit_id]

    try:
        while True:
            try:
                event = await asyncio.wait_for(q.get(), timeout=120.0)
            except asyncio.TimeoutError:
                await websocket.send_json({"type": "heartbeat", "audit_id": audit_id})
                continue

            if event.get("type") == "__done__":
                break  # Pipeline finished

            await websocket.send_json(event)

            if event.get("type") in ("complete", "error"):
                break

    except WebSocketDisconnect:
        logger.info(f"WebSocket disconnected for audit {audit_id}")
    except Exception as e:
        logger.error(f"WebSocket error for audit {audit_id}: {e}")
        try:
            await websocket.send_json({"type": "error", "error": str(e)})
        except Exception:
            pass
    finally:
        # Clean up queue
        _audit_queues.pop(audit_id, None)
        try:
            await websocket.close()
        except Exception:
            pass
        logger.info(f"WebSocket closed for audit {audit_id}")


# ─── Coach Helpers ─────────────────────────────────────────────────────────────

def _extract_code_blocks(text: str):
    """Extract ```language\ncode\n``` blocks from a reply string."""
    import re
    pattern = re.compile(r"```(\w+)?\n(.*?)```", re.DOTALL)
    blocks = []
    for match in pattern.finditer(text):
        lang = match.group(1) or "html"
        code = match.group(2).strip()
        blocks.append({"language": lang, "code": code})
    return blocks


def _structured_coach_reply(message: str, ctx: dict) -> str:
    """Return a contextual expert response when Ollama is unavailable."""
    msg = message.lower()
    url = ctx.get("url", "the audited site")
    ux = ctx.get("uxScore", "N/A")
    a11y = ctx.get("a11yScore", "N/A")
    critical = ctx.get("criticalCount", 0)

    if any(kw in msg for kw in ("alt", "image", "1.1.1", "non-text")):
        return (
            f"**WCAG 1.1.1 — Non-text Content** is one of the most impactful accessibility fixes.\n\n"
            f"{'On ' + url + ', ' + str(critical) + ' critical issues were detected.' if critical else ''}\n\n"
            "Every `<img>` element must have an `alt` attribute. For informative images, describe what the image shows:\n\n"
            "```html\n<img src=\"/hero.jpg\" alt=\"Team of engineers collaborating on a whiteboard\">\n```\n\n"
            "For purely decorative images that convey no information, use empty alt:\n\n"
            "```html\n<img src=\"/decoration.png\" alt=\"\" role=\"presentation\">\n```\n\n"
            "**Why it matters:** Without alt text, blind users get zero information about the image. "
            "Screen readers may announce the file name instead (e.g., 'hero-banner-2024-final-v3.jpg'), which is confusing."
        )

    if any(kw in msg for kw in ("label", "form", "input", "1.3.1")):
        return (
            f"**WCAG 1.3.1 — Info and Relationships** requires all form inputs to have associated labels.\n\n"
            "The correct pattern:\n\n"
            "```html\n<div class=\"form-group\">\n  <label for=\"email\">Email Address <span aria-hidden=\"true\">*</span></label>\n"
            "  <input type=\"email\" id=\"email\" name=\"email\" required autocomplete=\"email\"\n"
            "         aria-describedby=\"email-error\">\n"
            "  <span id=\"email-error\" class=\"error\" role=\"alert\" aria-live=\"polite\"></span>\n</div>\n```\n\n"
            "```css\n.form-group { display: flex; flex-direction: column; gap: 6px; }\n"
            "label { font-weight: 600; font-size: 14px; color: #1f2937; }\n"
            "input:focus-visible { outline: 3px solid #3b82f6; outline-offset: 2px; border-radius: 6px; }\n"
            ".error { color: #dc2626; font-size: 12px; }\n```"
        )

    if any(kw in msg for kw in ("contrast", "color", "1.4.3")):
        return (
            "**WCAG 1.4.3 — Contrast (Minimum)** requires:\n"
            "- Normal text (< 18pt): minimum **4.5:1** contrast ratio\n"
            "- Large text (≥ 18pt or 14pt bold): minimum **3:1** contrast ratio\n"
            "- WCAG AAA (1.4.6): 7:1 for normal, 4.5:1 for large text\n\n"
            "**Tools:** Use [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/) or browser DevTools.\n\n"
            "```css\n/* Accessible color palette example */\n"
            ":root {\n  --text-primary: #111827;   /* on white: 16.1:1 ✓ */\n"
            "  --text-secondary: #374151; /* on white: 10.7:1 ✓ */\n"
            "  --text-muted: #6b7280;     /* on white: 4.6:1  ✓ */\n"
            "  --text-disabled: #9ca3af;  /* on white: 2.8:1  ✗ avoid for essential text */\n}\n```"
        )

    if any(kw in msg for kw in ("focus", "keyboard", "2.4.7", "outline")):
        return (
            "**WCAG 2.4.7 — Focus Visible** is commonly violated by `outline: none` in global CSS.\n\n"
            "The modern approach separates mouse and keyboard focus:\n\n"
            "```css\n/* Remove outline for mouse users, keep for keyboard users */\n"
            "*:focus:not(:focus-visible) { outline: none; }\n\n"
            "/* Visible, beautiful focus for keyboard/screen reader users */\n"
            "*:focus-visible {\n  outline: 3px solid #3b82f6;\n  outline-offset: 3px;\n  border-radius: 4px;\n  transition: outline-offset 0.1s ease;\n}\n\n"
            "/* Dark mode support */\n@media (prefers-color-scheme: dark) {\n"
            "  *:focus-visible { outline-color: #60a5fa; }\n}\n```\n\n"
            "This ensures keyboard users always see where they are, while mouse users get a clean look."
        )

    if any(kw in msg for kw in ("nielsen", "heuristic", "usability")):
        return (
            "**Nielsen's 10 Usability Heuristics** (Jakob Nielsen, 1994) are the gold standard for UX evaluation:\n\n"
            "1. **Visibility of System Status** — Always keep users informed (loading states, progress)\n"
            "2. **Match Between System and Real World** — Use user language, not tech jargon\n"
            "3. **User Control and Freedom** — Undo, redo, cancel everywhere\n"
            "4. **Consistency and Standards** — Follow platform conventions\n"
            "5. **Error Prevention** — Prevent problems before they occur\n"
            "6. **Recognition Rather Than Recall** — Minimize memory load with visible options\n"
            "7. **Flexibility and Efficiency** — Shortcuts for expert users\n"
            "8. **Aesthetic and Minimalist Design** — Remove irrelevant information\n"
            "9. **Help Recognize, Diagnose, Recover from Errors** — Plain-language error messages\n"
            "10. **Help and Documentation** — Easy-to-search contextual help\n\n"
            f"{'Your audit of ' + url + ' scored ' + str(ux) + '/100 on UX heuristics.' if ux != 'N/A' else ''}"
        )

    if any(kw in msg for kw in ("fix first", "priority", "which", "start", "top")):
        if critical and int(critical) > 0:
            return (
                f"Based on your audit of **{url}**, I recommend fixing issues in this order:\n\n"
                f"**Priority 1 — Critical WCAG Level A violations** ({critical} found)\n"
                "These are legally required in many jurisdictions (ADA, EAA, AODA) and have the biggest impact on users with disabilities.\n\n"
                "**Priority 2 — Form usability issues**\n"
                "Form problems directly impact conversion rates. Every missing label = lost conversions.\n\n"
                "**Priority 3 — Navigation & structure**\n"
                "Skip links, breadcrumbs, and proper heading hierarchy significantly improve the experience for all users.\n\n"
                f"Your accessibility score is **{a11y}/100**. "
                "Each critical fix typically yields a 2-5% conversion lift based on industry research."
            )
        return (
            f"Your site scored **{ux}/100 UX** and **{a11y}/100 Accessibility**. "
            "Start with any Critical severity issues in the Top Improvements tab — "
            "these have the highest business impact with the least development effort."
        )

    # Default contextual response
    return (
        f"As your AI UX Coach, here's my analysis of your question about **'{message}'**:\n\n"
        f"{'Your audit of **' + url + '** shows UX score: **' + str(ux) + '/100** and Accessibility: **' + str(a11y) + '/100**.' if ux != 'N/A' else ''}\n\n"
        "For the most impactful improvements, I recommend:\n\n"
        "1. **Resolve all Critical WCAG A violations first** — these are the legal baseline\n"
        "2. **Fix missing form labels** — biggest immediate conversion impact\n"
        "3. **Add skip navigation links** — quick win for keyboard users\n"
        "4. **Improve CTA hierarchy** — typically yields 15-25% conversion improvement\n\n"
        "Visit the **Before vs After** tab to see exact HTML/CSS code for each fix. "
        "You can also ask me to generate specific code for any issue you see in the dashboard."
    )
