from pydantic import BaseModel
from typing import List, Optional


class IssueRecord(BaseModel):
    id: str
    page_url: str
    element_selector: str
    element_type: str
    proof_source: List[str]  # ["DOM", "AXE", "VISION", "PLAYWRIGHT", "CSS"]
    confidence: int  # 0-100
    severity: str  # Critical | Warning | Minor
    screenshot_reference: Optional[str] = None
    html_snippet: str
    css_snippet: str
    reasoning: str
    recommended_fix: str

    # Backwards compatibility mappings
    element: Optional[str] = None
    description: Optional[str] = None
    recommendation: Optional[str] = None
    standard: Optional[str] = None
    heuristic: Optional[str] = None
    issue_type: Optional[str] = None
    evidence_snippet: Optional[str] = None
    before_html: Optional[str] = None
    ux_reasoning: Optional[str] = None


class BoundingBoxRecord(BaseModel):
    issue_id: str
    severity: str
    label: str
    x: float
    y: float
    width: float
    height: float


class PersonaRecord(BaseModel):
    name: str
    role: str
    score: int
    satisfaction: str  # High | Medium | Low
    friction: str
    recommendation: str


class BusinessImpactRecord(BaseModel):
    conversion_lift_percentage: float
    estimated_monthly_revenue_lift: float
    csat_lift_percentage: float
    development_effort: str  # High | Medium | Low


class UXCorrection(BaseModel):
    id: str
    title: str
    severity: str  # Critical | Warning | Minor
    element_selector: str
    before_html: str
    after_html: str
    after_css: str
    ux_fix_explanation: str
    accessibility_fix_notes: Optional[str] = None


class BeforeAfterRecord(BaseModel):
    page_url: str
    issues: List[UXCorrection]


class PageRecord(BaseModel):
    url: str
    path: str
    parent_path: str
    title: str
    uxScore: int
    a11yScore: int
    uxIssues: List[IssueRecord]
    a11yIssues: List[IssueRecord]
    personas: List[PersonaRecord]
    businessImpact: BusinessImpactRecord
    beforeAfter: BeforeAfterRecord
    screenshotBoxes: List[BoundingBoxRecord]
    screenshot_b64: Optional[str] = None


class HistoryScore(BaseModel):
    timestamp: str
    uxScore: int
    a11yScore: int


class AuditRecord(BaseModel):
    id: str
    url: str
    timestamp: str
    overallScore: int
    uxScore: int
    a11yScore: int
    totalPages: int
    criticalCount: int
    warningCount: int
    minorCount: int
    resolvedIssuesCount: int
    historyScores: List[HistoryScore]
    pages: List[PageRecord]


class AuditStartRequest(BaseModel):
    url: str


class CoachChatRequest(BaseModel):
    message: str
    url: Optional[str] = None
    audit_context: Optional[dict] = None


class ProgressEvent(BaseModel):
    type: str           # progress | complete | error
    audit_id: str
    status: str
    current_page: str
    discovered_count: int
    completed_count: int
    current_agent: str
    percent: int
    estimated_time: str
    error: Optional[str] = None


class GenerateFixRequest(BaseModel):
    url: str
    issue_id: str
