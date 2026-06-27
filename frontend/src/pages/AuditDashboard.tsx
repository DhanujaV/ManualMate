import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe, Search, Zap, CheckCircle, AlertCircle, Loader2, Clock, FileText } from 'lucide-react';
import { useAudit } from '../context/AuditContext';

const agentDescriptions: Record<string, string> = {
  'Explorer Agent (Crawling layout structure)': 'Mapping all internal pages and building site hierarchy tree...',
  'Vision Agent (Analyzing visual viewport screenshots)': 'Capturing screenshots and submitting to Gemini 2.5 Vision for layout analysis...',
  "UX Evaluation Agent (Applying Nielsen's 10 Usability Heuristics)": 'Evaluating usability patterns against all 10 Nielsen dimensions...',
  'Accessibility Engine (Validating WCAG 2.2 accessibility rules)': 'Running WCAG 2.2 A/AA/AAA checks on contrast, ARIA labels, keyboard navigation...',
  'Persona Simulation Agent (Injecting user personas parameters)': 'Simulating experiences for 5 distinct user personas across discovered pages...',
  'Business Impact Agent (Estimating conversion rate and revenue loss)': 'Computing business KPI impacts from usability and accessibility failures...',
  'Prioritization Agent (Highlighting Top 3 Improvements)': 'Ranking improvements by combined UX impact, A11y score, and dev effort estimates...',
};

const AuditDashboard: React.FC = () => {
  const { startAudit, isAuditing, crawlProgress } = useAudit();
  const [inputUrl, setInputUrl] = useState('');
  const [urlError, setUrlError] = useState('');

  const validateAndStart = () => {
    setUrlError('');
    if (!inputUrl.trim()) { setUrlError('Please enter a website URL to audit.'); return; }
    let url = inputUrl.trim();
    if (!/^https?:\/\//i.test(url)) url = 'https://' + url;
    try {
      new URL(url);
      startAudit(url);
    } catch {
      setUrlError('Please enter a valid URL (e.g., https://yoursite.com)');
    }
  };

  const exampleSites = ['https://example.com', 'https://github.com', 'https://stripe.com', 'https://airbnb.com'];

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-16">
      <AnimatePresence mode="wait">
        {!isAuditing ? (
          <motion.div key="input" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="w-full max-w-2xl">
            <div className="text-center mb-12">
              <motion.div
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                className="w-20 h-20 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center shadow-2xl"
                style={{ boxShadow: '0 0 60px rgba(59,130,246,0.3)' }}
              >
                <Globe size={36} className="text-white" />
              </motion.div>
              <h1 className="text-4xl font-bold text-white mb-3">Start Your UX Audit</h1>
              <p className="text-slate-400 text-lg">Enter any website URL and let 7 AI agents analyze every page.</p>
            </div>

            <div className="glass-card p-8 rounded-3xl">
              <label className="block text-sm font-medium text-slate-300 mb-2">Website URL</label>
              <div className="flex gap-3">
                <div className="flex-1 relative">
                  <Globe size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    id="audit-url-input"
                    type="url"
                    value={inputUrl}
                    onChange={(e) => setInputUrl(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && validateAndStart()}
                    placeholder="https://yourwebsite.com"
                    className="w-full pl-11 pr-4 py-4 rounded-xl text-white placeholder-slate-500 text-sm font-medium outline-none focus:ring-2 focus:ring-blue-500/40 transition-all"
                    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
                  />
                </div>
                <motion.button
                  id="start-audit-btn"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={validateAndStart}
                  className="bg-gradient-button px-6 py-4 rounded-xl font-semibold text-white flex items-center gap-2 text-sm"
                  style={{ boxShadow: '0 0 20px rgba(59,130,246,0.3)' }}
                >
                  <Search size={16} />
                  Audit
                </motion.button>
              </div>

              {urlError && <p className="mt-2 text-sm text-red-400 flex items-center gap-1.5"><AlertCircle size={14} />{urlError}</p>}

              <div className="mt-6">
                <p className="text-xs text-slate-500 mb-3">Try an example site:</p>
                <div className="flex flex-wrap gap-2">
                  {exampleSites.map((site) => (
                    <button key={site} onClick={() => setInputUrl(site)}
                      className="px-3 py-1.5 rounded-lg text-xs text-slate-400 border border-white/[0.06] hover:border-blue-500/30 hover:text-blue-300 transition-all">
                      {site.replace('https://', '')}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-8 grid grid-cols-2 gap-3">
                {['Website Structure Mapping', 'Gemini 2.5 Vision Analysis', "Nielsen's 10 Heuristics", 'WCAG 2.2 A/AA/AAA', 'Persona Satisfaction Scores', 'Revenue Impact Estimates', 'AI-Generated Code Fixes', 'Progress Tracking'].map((item) => (
                  <div key={item} className="flex items-center gap-2 text-xs text-slate-400">
                    <CheckCircle size={12} className="text-emerald-400 flex-shrink-0" />{item}
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div key="progress" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="w-full max-w-2xl">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-white mb-2">Auditing Your Website</h2>
              <p className="text-slate-400">Our AI agents are working through every page...</p>
            </div>

            <div className="glass-card p-8 rounded-3xl space-y-6">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-semibold text-white">{crawlProgress.percent}% Complete</span>
                  <span className="flex items-center gap-1.5 text-xs text-slate-400"><Clock size={12} />{crawlProgress.estimatedTime} remaining</span>
                </div>
                <div className="h-2.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                  <motion.div
                    className="h-full rounded-full"
                    style={{ background: 'linear-gradient(90deg, #3b82f6, #8b5cf6)' }}
                    animate={{ width: `${crawlProgress.percent}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
              </div>

              <div className="p-4 rounded-2xl" style={{ background: 'rgba(59,130,246,0.06)', border: '1px solid rgba(59,130,246,0.15)' }}>
                <div className="flex items-center gap-3 mb-2">
                  <Loader2 size={16} className="text-blue-400 animate-spin" />
                  <span className="text-xs font-semibold text-blue-400 uppercase tracking-wider">Active Agent</span>
                </div>
                <p className="text-sm font-medium text-white">{crawlProgress.currentAgent}</p>
                <p className="text-xs text-slate-400 mt-1">{agentDescriptions[crawlProgress.currentAgent] || 'Processing...'}</p>
              </div>

              <div className="grid grid-cols-3 gap-4">
                {[
                  { icon: Globe, color: 'text-blue-400', value: crawlProgress.discoveredCount, label: 'Pages Discovered' },
                  { icon: CheckCircle, color: 'text-emerald-400', value: crawlProgress.completedCount, label: 'Pages Successfully Analyzed' },
                  { icon: FileText, color: 'text-violet-400', value: `${crawlProgress.completedCount > 0 ? Math.round((crawlProgress.completedCount / Math.max(1, crawlProgress.discoveredCount)) * 100) : 0}%`, label: 'Coverage' },
                ].map(({ icon: Icon, color, value, label }) => (
                  <div key={label} className="text-center p-4 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <Icon size={18} className={`${color} mx-auto mb-2`} />
                    <p className="text-xl font-bold text-white">{value}</p>
                    <p className="text-xs text-slate-400">{label}</p>
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-3 px-4 py-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)' }}>
                <Zap size={14} className="text-amber-400 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-[10px] text-slate-500 mb-0.5">CURRENTLY SCANNING</p>
                  <p className="text-xs text-slate-300 truncate font-mono">{crawlProgress.currentPage || 'Initializing...'}</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AuditDashboard;
