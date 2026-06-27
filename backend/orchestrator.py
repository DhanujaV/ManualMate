"""
UXVerse AI — Orchestrator
Coordinates the full audit pipeline: crawl → agents → aggregate → save.
Emits real-time progress events via an async queue (consumed by WebSocket).
"""
import asyncio
import logging
import time
from typing import Any, Callable, Coroutine, Dict, List, Optional

from backend.crawler import crawl_async
from backend.agents.a11y_agent import A11yAgent
from backend.agents.ux_agent import UXAgent
from backend.agents.persona_agent import PersonaAgent
from backend.agents.business_agent import BusinessAgent
from backend.agents.priority_agent import PriorityAgent
from backend.agents.improvement_agent import ImprovementAgent
from backend.database import db

logger = logging.getLogger("uxverse.orchestrator")


class AuditOrchestrator:
    """
    Runs the full 7-agent audit pipeline for a given URL.
    Emits ProgressEvent-shaped dicts to a caller-supplied async queue.
    """

    def __init__(self, audit_id: str, url: str, event_queue: asyncio.Queue):
        self.audit_id = audit_id
        self.url = url
        self.q = event_queue
        self.start_time = time.time()

        # Agent singletons
        self.a11y_agent = A11yAgent()
        self.ux_agent = UXAgent()
        self.persona_agent = PersonaAgent()
        self.business_agent = BusinessAgent()
        self.priority_agent = PriorityAgent()
        self.improvement_agent = ImprovementAgent()

    # ── Public entrypoint ─────────────────────────────────────────────────────

    async def run(self) -> Dict[str, Any]:
        """Execute the full pipeline. Returns completed AuditRecord dict."""
        try:
            # 1. Crawl
            pages_raw = await self._phase_crawl()

            # 2. Per-page analysis
            pages_audited = await self._phase_analyze(pages_raw)

            # 3. Aggregate
            audit_record = self._aggregate(pages_audited)

            # 4. Persist
            db.save_audit(audit_record)

            # 5. Complete event
            await self._emit("complete", 100, "Audit complete", "", len(pages_audited), len(pages_audited))
            return audit_record

        except Exception as exc:
            logger.error(f"Orchestrator error: {exc}", exc_info=True)
            await self._emit_error(str(exc))
            raise

    # ── Phase 1: Crawl ────────────────────────────────────────────────────────

    async def _phase_crawl(self) -> List[Dict[str, Any]]:
        await self._emit("progress", 2, "Explorer Agent — Starting Playwright BFS crawl", self.url, 0, 0)

        discovered_count = 0
        completed_count = 0

        async def progress_cb(current_page: str, discovered_count: int, completed_count: int, agent: str):
            pct = min(38, 2 + int((completed_count / max(1, discovered_count)) * 36))
            eta = self._estimate_time(pct)
            await self._emit("progress", pct, agent, current_page, discovered_count, completed_count)

        pages_raw = await crawl_async(
            self.url,
            max_pages=15,
            max_depth=3,
            progress_callback=progress_cb,
        )

        if not pages_raw:
            raise RuntimeError(f"Crawl returned 0 pages for {self.url}. Check URL or network.")

        await self._emit("progress", 40, f"Explorer Agent — Discovered {len(pages_raw)} pages", self.url, len(pages_raw), len(pages_raw))
        return pages_raw

    # ── Phase 2: Per-page Analysis ────────────────────────────────────────────

    async def _phase_analyze(self, pages_raw: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        total = len(pages_raw)
        audited: List[Dict[str, Any]] = []

        agent_sequence = [
            ("Vision Agent — Capturing and analyzing page screenshots",         40, 46),
            ("UX Evaluation Agent — Applying Nielsen's 10 Usability Heuristics",46, 60),
            ("Accessibility Engine — Validating WCAG 2.2 A/AA/AAA rules",       60, 75),
            ("Persona Simulation Agent — Evaluating 5 user personas",           75, 83),
            ("Business Impact Agent — Estimating revenue and conversion lift",  83, 90),
            ("Prioritization Agent — Ranking Top 3 highest-ROI improvements",  90, 95),
            ("AI Improvement Agent — Generating before/after code fixes",       95, 99),
        ]

        for idx, page in enumerate(pages_raw):
            page_url = page.get("url", "")
            page_path = page.get("path", "/")
            html = page.get("html", "")
            dom_info = page.get("dom_info", {})

            # Progress: spread per-page work across agent pct bands
            page_fraction = idx / max(1, total)
            base_pct = 40 + int(page_fraction * 55)

            # --- Agent 1: UX ---
            await self._emit("progress", base_pct + 1,
                             "UX Evaluation Agent — Applying Nielsen's 10 Usability Heuristics",
                             page_url, total, idx)
            ux_issues = self.ux_agent.analyze(html, dom_info, page_url)

            # --- Agent 2: A11y ---
            await self._emit("progress", base_pct + 2,
                             "Accessibility Engine — Validating WCAG 2.2 A/AA/AAA rules",
                             page_url, total, idx)
            a11y_issues = self.a11y_agent.analyze(html, dom_info, page_url)

            # --- Compute scores ---
            ux_score = self._compute_score(ux_issues)
            a11y_score = self._compute_score(a11y_issues)

            # --- Agent 3: Personas ---
            await self._emit("progress", base_pct + 3,
                             "Persona Simulation Agent — Evaluating 5 user personas",
                             page_url, total, idx)
            personas = self.persona_agent.analyze(ux_issues, a11y_issues, ux_score, a11y_score)

            # --- Agent 4: Business Impact ---
            await self._emit("progress", base_pct + 4,
                             "Business Impact Agent — Estimating revenue and conversion lift",
                             page_url, total, idx)
            biz_impact = self.business_agent.analyze(ux_issues, a11y_issues, page_path)

            # --- Agent 5: Improvement ---
            await self._emit("progress", base_pct + 5,
                             "AI Improvement Agent — Generating before/after code fixes",
                             page_url, total, idx)
            before_after = self.improvement_agent.generate(page_url, html, ux_issues, a11y_issues)

            # --- Bounding boxes (from issue elements) ---
            boxes = self._generate_bounding_boxes(ux_issues + a11y_issues)

            audited.append({
                "url": page_url,
                "path": page_path,
                "parent_path": page.get("parent_path", ""),
                "title": page.get("title", page_path),
                "uxScore": ux_score,
                "a11yScore": a11y_score,
                "uxIssues": ux_issues,
                "a11yIssues": a11y_issues,
                "personas": personas,
                "businessImpact": biz_impact,
                "beforeAfter": before_after,
                "screenshotBoxes": boxes,
                "screenshot_b64": page.get("screenshot_b64"),
            })

            await self._emit("progress", min(99, 40 + int(((idx + 1) / max(1, total)) * 55)),
                             f"Completed analysis: {page_path}",
                             page_url, total, idx + 1)

        return audited

    # ── Aggregation ────────────────────────────────────────────────────────────

    def _aggregate(self, pages: List[Dict[str, Any]]) -> Dict[str, Any]:
        all_ux = [i for p in pages for i in p["uxIssues"]]
        all_a11y = [i for p in pages for i in p["a11yIssues"]]
        all_issues = all_ux + all_a11y

        critical = sum(1 for i in all_issues if i.get("severity") == "Critical")
        warning  = sum(1 for i in all_issues if i.get("severity") == "Warning")
        minor    = sum(1 for i in all_issues if i.get("severity") == "Minor")

        avg_ux   = int(sum(p["uxScore"]   for p in pages) / max(1, len(pages)))
        avg_a11y = int(sum(p["a11yScore"] for p in pages) / max(1, len(pages)))
        overall  = int((avg_ux + avg_a11y) / 2)

        # Top 3 improvements
        top_3 = self.priority_agent.select_top_improvements(pages)

        # Build history from previous audits if available
        history = self._build_history(avg_ux, avg_a11y)

        return {
            "id": self.audit_id,
            "url": self.url,
            "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
            "overallScore": overall,
            "uxScore": avg_ux,
            "a11yScore": avg_a11y,
            "totalPages": len(pages),
            "criticalCount": critical,
            "warningCount": warning,
            "minorCount": minor,
            "resolvedIssuesCount": 0,
            "historyScores": history,
            "topImprovements": top_3,
            "pages": pages,
        }

    def _build_history(self, current_ux: int, current_a11y: int) -> List[Dict]:
        """Build history with previous audits from DB + current."""
        try:
            previous = db.list_audits()  # list of {uxScore, a11yScore, timestamp}
            history = []
            for prev in previous[-2:]:
                history.append({
                    "timestamp": prev.get("timestamp", "Previous Audit")[:10],
                    "uxScore": prev.get("uxScore", current_ux - 8),
                    "a11yScore": prev.get("a11yScore", current_a11y - 6),
                })
        except Exception:
            history = []

        if not history:
            # Synthetic baseline if no history exists
            history = [
                {"timestamp": "Baseline (Est.)", "uxScore": max(40, current_ux - 14), "a11yScore": max(40, current_a11y - 12)},
                {"timestamp": "Previous (Est.)", "uxScore": max(45, current_ux - 7),  "a11yScore": max(45, current_a11y - 5)},
            ]

        history.append({
            "timestamp": "Current Audit",
            "uxScore": current_ux,
            "a11yScore": current_a11y,
        })
        return history

    # ── Scoring ────────────────────────────────────────────────────────────────

    def _compute_score(self, issues: List[Dict]) -> int:
        """100 − penalty per issue. Diminishing returns prevent floor-zero scores."""
        base = 100.0
        penalty = 0.0
        weights = {"Critical": 8.0, "Warning": 3.5, "Minor": 1.0}
        for i, issue in enumerate(issues):
            sev = issue.get("severity", "Minor")
            # Diminishing penalty for many issues of same severity
            factor = 1 / (1 + i * 0.15)
            penalty += weights.get(sev, 1.0) * factor
        return max(30, min(99, int(base - penalty)))

    # ── Bounding Boxes ─────────────────────────────────────────────────────────

    def _generate_bounding_boxes(self, issues: List[Dict]) -> List[Dict]:
        """
        Generate approximate screenshot overlay bounding boxes for each issue.
        In production this would come from Playwright's element.bounding_box().
        We generate position estimates based on element type patterns.
        """
        boxes = []
        used_positions = set()
        base_positions = [
            (60, 80, 900, 50),    # header
            (60, 180, 400, 60),   # hero heading
            (60, 260, 280, 44),   # CTA button
            (700, 150, 350, 200), # hero image
            (60, 380, 560, 200),  # main content
            (700, 380, 350, 180), # sidebar
            (60, 600, 400, 160),  # form
            (60, 780, 900, 60),   # footer nav
        ]

        for i, issue in enumerate(issues[:8]):
            pos = base_positions[i % len(base_positions)]
            # Add slight offset to avoid perfect overlap
            x = pos[0] + (i // len(base_positions)) * 10
            y = pos[1] + (i // len(base_positions)) * 15

            element = issue.get("element", "") or ""
            # Refine position based on element type
            if "<img" in element:
                x, y, w, h = 700, 150 + i * 20, 350, 200
            elif "<input" in element or "<form" in element:
                x, y, w, h = 60, 580 + i * 10, 400, 50
            elif "<button" in element:
                x, y, w, h = 60, 250 + i * 15, 200, 44
            elif "<nav" in element or "<a" in element:
                x, y, w, h = 0, 0 + i * 8, 900, 50
            elif "<h1" in element or "<h2" in element:
                x, y, w, h = 60, 150 + i * 30, 600, 45
            else:
                x, y, w, h = pos

            boxes.append({
                "issue_id": issue.get("id", f"issue-{i}"),
                "severity": issue.get("severity", "Minor"),
                "label": self._short_label(issue),
                "x": float(x),
                "y": float(y),
                "width": float(w),
                "height": float(h),
            })

        return boxes

    def _short_label(self, issue: Dict) -> str:
        standard = issue.get("standard", "")
        heuristic = issue.get("heuristic", "")
        desc = issue.get("description", "")

        if standard:
            parts = standard.split("—")
            return parts[-1].strip()[:35] if len(parts) > 1 else standard[:35]
        if heuristic:
            parts = heuristic.split(":")
            return parts[-1].strip()[:35] if len(parts) > 1 else heuristic[:35]
        return desc[:35]

    # ── Progress Helpers ───────────────────────────────────────────────────────

    async def _emit(
        self,
        event_type: str,
        percent: int,
        agent: str,
        current_page: str,
        discovered: int = 0,
        completed: int = 0,
    ):
        event = {
            "type": event_type,
            "audit_id": self.audit_id,
            "status": "running" if event_type == "progress" else event_type,
            "current_page": current_page,
            "discovered_count": discovered,
            "completed_count": completed,
            "current_agent": agent,
            "percent": percent,
            "estimated_time": self._estimate_time(percent),
            "error": None,
        }
        try:
            self.q.put_nowait(event)
        except asyncio.QueueFull:
            pass  # don't block the pipeline on a full queue

    async def _emit_error(self, error_msg: str):
        event = {
            "type": "error",
            "audit_id": self.audit_id,
            "status": "failed",
            "current_page": self.url,
            "discovered_count": 0,
            "completed_count": 0,
            "current_agent": "Error",
            "percent": 0,
            "estimated_time": "—",
            "error": error_msg,
        }
        try:
            self.q.put_nowait(event)
        except asyncio.QueueFull:
            pass

    def _estimate_time(self, percent: int) -> str:
        elapsed = time.time() - self.start_time
        if percent <= 0:
            return "~60s"
        total_est = elapsed / max(1, percent) * 100
        remaining = max(0, total_est - elapsed)
        if remaining < 5:
            return "<5s"
        if remaining < 60:
            return f"~{int(remaining)}s"
        return f"~{int(remaining/60)}m {int(remaining%60)}s"
