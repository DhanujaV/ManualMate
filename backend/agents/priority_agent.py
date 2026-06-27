"""
Priority Agent — Selects the Top 3 highest-ROI improvements across all audited pages.
Ranks using a strict normalized multi-factor priority algorithm:
Score = Severity (35%) + Business Impact (25%) + A11y Impact (15%) + Users Affected (10%) + Dev Effort (10%) + Confidence (5%)
"""
import logging
from typing import List, Dict, Any

logger = logging.getLogger("uxverse.priority_agent")


class PriorityAgent:
    """Selects and ranks the top 3 most impactful issues across all audited pages using a weighted score."""

    def select_top_improvements(self, pages: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Collect all unique issues from all pages, compute their priority score,
        and return the top 3 highest-scoring items.
        """
        raw_issues_pool = []
        
        # 1. Count occurrences of issue types across pages to determine Users Affected
        issue_occurrence_counts = {}
        for page in pages:
            all_page_issues = page.get("uxIssues", []) + page.get("a11yIssues", [])
            for issue in all_page_issues:
                issue_key = issue.get("standard") or issue.get("heuristic") or issue.get("id", "")
                issue_occurrence_counts[issue_key] = issue_occurrence_counts.get(issue_key, 0) + 1

        # 2. Iterate over all issues to score them
        for page in pages:
            page_path = page.get("path", "/")
            page_url  = page.get("url", "")
            page_title = page.get("title", page_path)
            biz = page.get("businessImpact", {})
            
            # Dev effort mapping: Low effort gets higher priority points (ROI)
            effort = biz.get("development_effort", "Medium")
            effort_score = {"Low": 100, "Medium": 60, "High": 30}.get(effort, 60)
            
            # Business impact score
            conv_lift = biz.get("conversion_lift_percentage", 0.0)
            biz_score = min(conv_lift * 20.0, 100.0)
            if biz_score == 0:
                # Fallback to estimated monthly lift sizing
                revenue_lift = biz.get("estimated_monthly_revenue_lift", 0.0)
                biz_score = 100.0 if revenue_lift > 2000 else (65.0 if revenue_lift > 500 else 30.0)

            all_page_issues = page.get("uxIssues", []) + page.get("a11yIssues", [])

            for issue in all_page_issues:
                severity = issue.get("severity", "Warning")
                sev_score = {"Critical": 100, "Warning": 60, "Minor": 30}.get(severity, 60)

                # Accessibility impact
                standard = issue.get("standard") or issue.get("issue_type") or ""
                if "A —" in standard:
                    a11y_score = 100.0
                elif "AA —" in standard:
                    a11y_score = 75.0
                else:
                    a11y_score = 40.0  # General UX heuristic

                # Users affected: depends on global elements and occurrence counts
                issue_key = issue.get("standard") or issue.get("heuristic") or issue.get("id", "")
                occ_count = issue_occurrence_counts.get(issue_key, 1)
                
                selector = issue.get("element_selector", "").lower()
                is_global = any(x in selector for x in ("header", "footer", "nav", "menu", "logo"))
                
                if is_global:
                    users_score = 100.0
                else:
                    users_score = min(50.0 + (occ_count * 15.0), 100.0)

                # AI Confidence score
                confidence = issue.get("confidence", 90.0)

                # Weighted Score Calculation (Sum of weights equals 1.0)
                raw_score = (
                    (sev_score * 0.35) +
                    (biz_score * 0.25) +
                    (a11y_score * 0.15) +
                    (users_score * 0.10) +
                    (effort_score * 0.10) +
                    (confidence * 0.05)
                )

                raw_issues_pool.append({
                    "score": raw_score,
                    "issue": issue,
                    "page_path": page_path,
                    "page_url": page_url,
                    "page_title": page_title,
                    "development_effort": effort,
                    "business_impact_label": "High" if biz_score >= 70 else ("Medium" if biz_score >= 45 else "Low"),
                })

        # 3. Sort descending by Priority Score
        raw_issues_pool.sort(key=lambda x: -x["score"])

        # 4. Deduplicate: select unique issue types to avoid repeating similar fixes
        seen_keys = set()
        top_selected = []
        for item in raw_issues_pool:
            issue = item["issue"]
            issue_key = issue.get("standard") or issue.get("heuristic") or issue.get("id", "")
            if issue_key not in seen_keys:
                seen_keys.add(issue_key)
                top_selected.append(item)

        # 5. Format to exact card properties for the frontend
        results = []
        for rank, item in enumerate(top_selected[:3], 1):
            issue = item["issue"]
            results.append({
                "rank": rank,
                "issueId": issue.get("id", f"priority-{rank}"),
                "page": item["page_path"],
                "pageTitle": item["page_title"],
                "pageUrl": item["page_url"],
                "issue": issue.get("description") or issue.get("reasoning") or "UX Violation",
                "severity": issue.get("severity", "Warning"),
                "standard": issue.get("standard") or issue.get("heuristic") or "WCAG Violation",
                "businessImpact": item["business_impact_label"],
                "fixTime": "2-4 hrs" if issue.get("severity") == "Critical" else "1-2 hrs",
                "uxGain": f"+{12 if issue.get('severity') == 'Critical' else 6} pts",
                "a11yGain": f"+{10 if issue.get('severity') == 'Critical' else 5} pts",
                "priority_score": round(item["score"], 1),
            })

        return results
