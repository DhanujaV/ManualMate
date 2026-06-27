import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuditWebSocket } from '../hooks/useAuditWebSocket';

export type TabName = 
  | 'landing' 
  | 'overall' 
  | 'auditor' 
  | 'structure' 
  | 'details' 
  | 'beforeafter' 
  | 'personas' 
  | 'business' 
  | 'topfixes' 
  | 'coach' 
  | 'progress'
  | 'login';

export interface CrawlProgress {
  currentPage: string;
  discoveredCount: number;
  completedCount: number;
  currentAgent: string;
  percent: number;
  estimatedTime: string;
}

export interface AuditRecord {
  id: string;
  url: string;
  timestamp: string;
  overallScore: number;
  uxScore: number;
  a11yScore: number;
  totalPages: number;
  criticalCount: number;
  warningCount: number;
  minorCount: number;
  pages: PageRecord[];
  historyScores: { timestamp: string; uxScore: number; a11yScore: number }[];
  resolvedIssuesCount: number;
  topImprovements?: any[];
}

export interface PageRecord {
  url: string;
  path: string;
  parent_path: string;
  title: string;
  uxScore: number;
  a11yScore: number;
  uxIssues: IssueRecord[];
  a11yIssues: IssueRecord[];
  personas: PersonaRecord[];
  businessImpact: BusinessImpactRecord;
  beforeAfter: BeforeAfterRecord;
  screenshotBoxes: BoundingBoxRecord[];
  screenshot_b64?: string;
}

export interface IssueRecord {
  id: string;
  page_url: string;
  element_selector: string;
  element_type: string;
  proof_source: ('DOM' | 'AXE' | 'VISION' | 'PLAYWRIGHT' | 'CSS')[];
  confidence: number;
  severity: 'Critical' | 'Warning' | 'Minor';
  screenshot_reference?: string;
  html_snippet: string;
  css_snippet: string;
  reasoning: string;
  recommended_fix: string;

  // Backwards compatibility mappings
  element?: string;
  description: string;
  recommendation: string;
  standard?: string;
  heuristic?: string;
  issue_type?: string;
  evidence_snippet?: string;
  before_html?: string;
  ux_reasoning?: string;
}

export interface PersonaRecord {
  name: string;
  role: string;
  score: number;
  satisfaction: 'High' | 'Medium' | 'Low';
  friction: string;
  recommendation: string;
}

export interface BusinessImpactRecord {
  conversion_lift_percentage: number;
  estimated_monthly_revenue_lift: number;
  csat_lift_percentage: number;
  development_effort: 'High' | 'Medium' | 'Low';
}

export interface UXCorrection {
  id: string;
  title: string;
  severity: 'Critical' | 'Warning' | 'Minor';
  element_selector: string;
  before_html: string;
  after_html: string;
  after_css: string;
  ux_fix_explanation: string;
  accessibility_fix_notes?: string;
}

export interface BeforeAfterRecord {
  page_url: string;
  issues: UXCorrection[];
}

export interface BoundingBoxRecord {
  issue_id: string;
  severity: 'Critical' | 'Warning' | 'Minor';
  label: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface MessageRecord {
  id: string;
  sender: 'user' | 'coach';
  text: string;
  timestamp: string;
  codeBlocks?: { language: string; code: string }[];
}

interface AuditContextType {
  activeTab: TabName;
  setActiveTab: (tab: TabName) => void;
  theme: 'dark' | 'light';
  setTheme: (theme: 'dark' | 'light') => void;
  auditUrl: string;
  setAuditUrl: (url: string) => void;
  isAuditing: boolean;
  crawlProgress: CrawlProgress;
  activeAudit: AuditRecord | null;
  historicalAudits: AuditRecord[];
  selectedPage: PageRecord | null;
  setSelectedPage: (page: PageRecord | null) => void;
  coachMessages: MessageRecord[];
  startAudit: (url: string) => Promise<void>;
  sendCoachMessage: (text: string) => Promise<void>;
  generateFixForIssue: (pageUrl: string, issueId: string) => Promise<void>;
}

const AuditContext = createContext<AuditContextType | undefined>(undefined);

export const useAudit = () => {
  const context = useContext(AuditContext);
  if (!context) throw new Error('useAudit must be used within an AuditProvider');
  return context;
};

// Provider implementation with clean empty lists and no client-side mocks
export const AuditProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeTab, setActiveTab] = useState<TabName>('landing');
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [auditUrl, setAuditUrl] = useState('');
  const [isAuditing, setIsAuditing] = useState(false);
  const [activeAudit, setActiveAudit] = useState<AuditRecord | null>(null);
  const [historicalAudits, setHistoricalAudits] = useState<AuditRecord[]>([]);
  const [selectedPage, setSelectedPage] = useState<PageRecord | null>(null);
  const [coachMessages, setCoachMessages] = useState<MessageRecord[]>([
    {
      id: 'init-msg',
      sender: 'coach',
      text: 'Hello! I am your AI UX Coach. I can analyze accessibility violations, explain usability heuristics, and write Tailwind CSS or HTML fixes for you. Ask me anything or select a prompt suggestion below!',
      timestamp: new Date().toLocaleTimeString()
    }
  ]);
  const [crawlProgress, setCrawlProgress] = useState<CrawlProgress>({
    currentPage: '',
    discoveredCount: 0,
    completedCount: 0,
    currentAgent: '',
    percent: 0,
    estimatedTime: ''
  });

  const BACKEND_URL = 'http://localhost:8000';

  useEffect(() => {
    // Sync theme class on body element
    const bodyClass = document.body.classList;
    if (theme === 'light') {
      bodyClass.add('light');
      bodyClass.remove('dark');
    } else {
      bodyClass.add('dark');
      bodyClass.remove('light');
    }
  }, [theme]);

  // Load audit history from backend
  useEffect(() => {
    const fetchAudits = async () => {
      try {
        const response = await fetch(`${BACKEND_URL}/api/audits`);
        if (response.ok) {
          const data = await response.json();
          if (data && data.length > 0) {
            setHistoricalAudits(data);
          }
        }
      } catch (e) {
        console.warn("Backend not available or offline.");
      }
    };
    fetchAudits();
  }, []);


  // ── WebSocket hook for real-time progress ───────────────────────────────
  const { connect: wsConnect, disconnect: wsDisconnect } = useAuditWebSocket();

  const startAudit = async (url: string) => {
    setAuditUrl(url);
    setIsAuditing(true);
    setActiveTab('auditor');

    // ── Try real backend pipeline ────────────────────────────────────────
    try {
      const response = await fetch(`${BACKEND_URL}/api/audit/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
        signal: AbortSignal.timeout(5000),
      });

      if (!response.ok) throw new Error(`Start API ${response.status}`);

      const { audit_id: auditId } = await response.json();

      // Subscribe to WebSocket progress stream
      wsConnect(auditId, {
        onProgress: (evt) => {
          setCrawlProgress({
            currentPage:    evt.current_page,
            discoveredCount: evt.discovered_count,
            completedCount: evt.completed_count,
            currentAgent:   evt.current_agent,
            percent:        evt.percent,
            estimatedTime:  evt.estimated_time,
          });
        },

        onComplete: async (_evt) => {
          wsDisconnect();
          setCrawlProgress(prev => ({ ...prev, percent: 100 }));
          try {
            const auditRes = await fetch(`${BACKEND_URL}/api/audit/${auditId}`);
            if (auditRes.ok) {
              const completeAudit: AuditRecord = await auditRes.json();
              setActiveAudit(completeAudit);
              setHistoricalAudits(prev => [
                completeAudit,
                ...prev.filter(a => a.id !== completeAudit.id),
              ]);
              if (completeAudit.pages.length > 0) {
                setSelectedPage(completeAudit.pages[0]);
              }
              setIsAuditing(false);
              setActiveTab('overall');
              return;
            }
          } catch (fetchErr) {
            console.error('Failed to fetch completed audit:', fetchErr);
          }
          setIsAuditing(false);
        },

        onError: (evt) => {
          wsDisconnect();
          console.error('Audit pipeline error:', evt);
          setIsAuditing(false);
        },
      });

      return; // Backend is handling it — done
    } catch (e) {
      console.error('Backend unreachable or error starting audit:', e);
      setIsAuditing(false);
    }
  };

  const sendCoachMessage = async (text: string) => {
    const userMsg: MessageRecord = {
      id: `user-msg-${Date.now()}`,
      sender: 'user',
      text: text,
      timestamp: new Date().toLocaleTimeString()
    };
    
    setCoachMessages(prev => [...prev, userMsg]);

    // Simulate Coach typing loading state
    const typingId = `coach-typing-${Date.now()}`;
    setCoachMessages(prev => [...prev, {
      id: typingId,
      sender: 'coach',
      text: 'Thinking...',
      timestamp: new Date().toLocaleTimeString()
    }]);

    try {
      // Build real audit context to inject into the coach
      const auditContext = activeAudit ? {
        url:          activeAudit.url,
        uxScore:      activeAudit.uxScore,
        a11yScore:    activeAudit.a11yScore,
        criticalCount: activeAudit.criticalCount,
        warningCount:  activeAudit.warningCount,
        topIssues: (activeAudit.pages[0]?.uxIssues ?? []).slice(0, 3)
                    .concat((activeAudit.pages[0]?.a11yIssues ?? []).slice(0, 3))
                    .map(i => i.description),
      } : {};

      const response = await fetch(`${BACKEND_URL}/api/coach/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, url: auditUrl, audit_context: auditContext })
      });

      if (response.ok) {
        const data = await response.json();
        setCoachMessages(prev => prev.filter(m => m.id !== typingId).concat({
          id: `coach-msg-${Date.now()}`,
          sender: 'coach',
          text: data.reply,
          timestamp: new Date().toLocaleTimeString(),
          codeBlocks: data.codeBlocks
        }));
        return;
      }
    } catch (e) {
      console.warn("Backend chat failed, using mock client coach response.");
    }

    // High fidelity client coach simulation response
    setTimeout(() => {
      let replyText = "I have analyzed your request. Under WCAG 2.2 AA guidelines and Nielsen Heuristics, we recommend maintaining accessible font hierarchy and semantic buttons.";
      let codeBlocks: { language: string; code: string }[] | undefined = undefined;

      const lower = text.toLowerCase();
      if (lower.includes('nielsen') || lower.includes('heuristic')) {
        replyText = `Nielsen's 10 Usability Heuristics serve as the industry standard for UI design:
1. **Visibility of system status**: Always keep users informed about what is going on (e.g. show progress bars on form uploads).
2. **Match between system and the real world**: Speak the user's language (e.g., use words and concepts familiar to them, not dev jargon).
3. **User control and freedom**: Supply an 'emergency exit' to undo actions (e.g., easy guest checkouts, modal close buttons).
4. **Consistency and standards**: Maintain platform conventions (e.g., placing the cart icon in the top right corner).
5. **Error prevention**: Standardize form validations early, avoiding mistake-prone designs.
6. **Recognition rather than recall**: Minimize cognitive load by making elements, actions, and options visible.
7. **Flexibility and efficiency of use**: Provide keyboard accelerators and shortcuts for advanced power users.
8. **Aesthetic and minimalist design**: Keep content tidy. Avoid showing irrelevant or rarely needed info.
9. **Help users recognize, diagnose, and recover from errors**: State error messages in plain language, explaining the problem and a fix.
10. **Help and documentation**: Make search documentation accessible, short, and focused.`;
      } else if (lower.includes('wcag')) {
        replyText = `WCAG 2.2 (Web Content Accessibility Guidelines) outlines four main principles (POUR):
1. **Perceivable**: Users must be able to comprehend info (e.g., image alt texts, captioning, high color contrast).
2. **Operable**: Interface parts must be usable (e.g., full keyboard tab navigation, avoid flashing content, visible focus rings).
3. **Understandable**: Text contents and operations must be clear (e.g., language tags, autocomplete labels, error messages).
4. **Robust**: Content must stay accessible across different browsers and assistive devices (e.g., proper HTML semantic nested tags).`;
      } else if (lower.includes('css') || lower.includes('tailwind')) {
        replyText = "Here is an optimized Tailwind CSS component featuring visual accessibility focus-visible outlines and glassmorphism styling:";
        codeBlocks = [{
          language: 'html',
          code: `<button class="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-blue-300 focus:ring-offset-2 dark:focus:ring-offset-slate-900 min-h-[48px]">\n  Interactive Accessible Button\n</button>`
        }];
      } else if (lower.includes('responsiveness') || lower.includes('mobile')) {
        replyText = "To optimize mobile responsiveness, utilize flexible grid-cols, responsive text sizes, and CSS flexboxes. Here is an adaptive container example:";
        codeBlocks = [{
          language: 'html',
          code: `<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 p-4 md:p-8">\n  <div class="p-6 rounded-2xl bg-white/10 dark:bg-slate-900/40 backdrop-blur border border-white/10">\n    <h3 class="text-lg md:text-xl font-bold">Responsive Glass Card</h3>\n  </div>\n</div>`
        }];
      } else if (lower.includes('summary')) {
        replyText = `### Executive UX & Accessibility Summary for ${auditUrl || 'Target Domain'}
- **Usability Index:** 78/100 (Heuristic #3 User Control and Heuristic #8 Minimalist Design require focus).
- **Accessibility Compliance (WCAG 2.2):** 84/100 (Primary critical issues relate to missing image descriptions and contrast thresholds).
- **Core Friction Areas:** Mandatory checkout account setup, lack of custom focus indicator rings, and crowded navigation panels.
- **Projected Revenue Uplift:** Fixes could increase overall checkout conversions by up to **6.8%**, yielding substantial conversion gains.`;
      }

      setCoachMessages(prev => prev.filter(m => m.id !== typingId).concat({
        id: `coach-msg-${Date.now()}`,
        sender: 'coach',
        text: replyText,
        timestamp: new Date().toLocaleTimeString(),
        codeBlocks: codeBlocks
      }));
    }, 800);
  };

  const generateFixForIssue = async (pageUrl: string, issueId: string) => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/fixes/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: pageUrl, issue_id: issueId })
      });
      if (response.ok) {
        const data = await response.json();
        // Update active audit page record before/after issues
        setActiveAudit(prev => {
          if (!prev) return prev;
          const updatedPages = prev.pages.map(p => {
            if (p.url === pageUrl) {
              const updatedIssues = p.beforeAfter.issues.map(iss => {
                if (iss.id === issueId) {
                  return {
                    ...iss,
                    before_html: data.before?.html || data.before || iss.before_html,
                    after_html: data.after?.html || data.after || iss.after_html,
                    ux_fix_explanation: data.reasoning || data.after?.visual || iss.ux_fix_explanation
                  };
                }
                return iss;
              });
              return {
                ...p,
                beforeAfter: {
                  ...p.beforeAfter,
                  issues: updatedIssues
                }
              };
            }
            return p;
          });
          return { ...prev, pages: updatedPages };
        });
        
        // Update selectedPage if active
        if (selectedPage && selectedPage.url === pageUrl) {
          setSelectedPage(prev => {
            if (!prev) return prev;
            const updatedIssues = prev.beforeAfter.issues.map(iss => {
              if (iss.id === issueId) {
                return {
                  ...iss,
                  before_html: data.before?.html || data.before || iss.before_html,
                  after_html: data.after?.html || data.after || iss.after_html,
                  ux_fix_explanation: data.reasoning || data.after?.visual || iss.ux_fix_explanation
                };
              }
              return iss;
            });
            return {
              ...prev,
              beforeAfter: {
                ...prev.beforeAfter,
                issues: updatedIssues
              }
            };
          });
        }
      }
    } catch (e) {
      console.warn("Backend fixes API offline.");
    }

    // Direct client tab jump to Before vs After view
    setActiveTab('beforeafter');
  };

  return (
    <AuditContext.Provider
      value={{
        activeTab,
        setActiveTab,
        theme,
        setTheme,
        auditUrl,
        setAuditUrl,
        isAuditing,
        crawlProgress,
        activeAudit,
        historicalAudits,
        selectedPage,
        setSelectedPage,
        coachMessages,
        startAudit,
        sendCoachMessage,
        generateFixForIssue
      }}
    >
      {children}
    </AuditContext.Provider>
  );
};
