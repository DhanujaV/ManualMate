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
  const [activeModality, setActiveModality] = useState<'url' | 'screenshot' | 'figma'>('url');
  
  // URL Mode State
  const [inputUrl, setInputUrl] = useState('');
  const [urlError, setUrlError] = useState('');

  // Screenshot Mode State
  const [screenshotFiles, setScreenshotFiles] = useState<{ file: File; previewUrl: string }[]>([]);
  const [screenshotError, setScreenshotError] = useState('');

  // Figma Mode State
  const [figmaUrl, setFigmaUrl] = useState('');
  const [figmaToken, setFigmaToken] = useState('');
  const [figmaError, setFigmaError] = useState('');

  // Bonus: Multi-Agent review flag
  const [enhanceAnalysis, setEnhanceAnalysis] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      addFiles(Array.from(e.target.files));
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files) {
      addFiles(Array.from(e.dataTransfer.files));
    }
  };

  const addFiles = (files: File[]) => {
    setScreenshotError('');
    const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
    const newFiles = files.filter(f => validTypes.includes(f.type));

    if (newFiles.length !== files.length) {
      setScreenshotError('Only PNG, JPG, JPEG, and WEBP images are supported.');
    }

    setScreenshotFiles(prev => {
      const combined = [...prev];
      for (const file of newFiles) {
        if (combined.length >= 10) {
          setScreenshotError('Maximum of 10 screenshot images can be uploaded.');
          break;
        }
        if (!combined.some(c => c.file.name === file.name && c.file.size === file.size)) {
          combined.push({
            file,
            previewUrl: URL.createObjectURL(file)
          });
        }
      }
      return combined;
    });
  };

  const removeFile = (index: number) => {
    setScreenshotFiles(prev => {
      const copy = [...prev];
      URL.revokeObjectURL(copy[index].previewUrl);
      copy.splice(index, 1);
      return copy;
    });
  };

  const toBase64 = (file: File): Promise<string> => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });

  const validateAndStart = async () => {
    setUrlError('');
    setScreenshotError('');
    setFigmaError('');

    if (activeModality === 'url') {
      if (!inputUrl.trim()) { setUrlError('Please enter a website URL to audit.'); return; }
      let url = inputUrl.trim();
      if (!/^https?:\/\//i.test(url)) url = 'https://' + url;
      try {
        new URL(url);
        startAudit(url, 'url', undefined, undefined, undefined, enhanceAnalysis);
      } catch {
        setUrlError('Please enter a valid URL (e.g., https://yoursite.com)');
      }
    } else if (activeModality === 'screenshot') {
      if (screenshotFiles.length === 0) {
        setScreenshotError('Please upload at least one screenshot to analyze.');
        return;
      }
      try {
        const base64List = await Promise.all(screenshotFiles.map(f => toBase64(f.file)));
        startAudit('Uploaded Screenshots', 'screenshot', base64List, undefined, undefined, enhanceAnalysis);
      } catch (err) {
        setScreenshotError('Failed to parse uploaded images. Please try again.');
      }
    } else if (activeModality === 'figma') {
      if (!figmaUrl.trim()) {
        setFigmaError('Please enter a Figma File URL.');
        return;
      }
      const isValidFigma = figmaUrl.includes('figma.com/file/') || figmaUrl.includes('figma.com/design/');
      if (!isValidFigma) {
        setFigmaError('Please enter a valid Figma file link (containing /file/ or /design/).');
        return;
      }
      startAudit(figmaUrl.trim(), 'figma', undefined, figmaUrl.trim(), figmaToken.trim() || undefined, enhanceAnalysis);
    }
  };

  const exampleSites = ['https://example.com', 'https://github.com', 'https://stripe.com', 'https://airbnb.com'];

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-16">
      <AnimatePresence mode="wait">
        {!isAuditing ? (
          <motion.div key="input" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="w-full max-w-2xl">
            <div className="text-center mb-10">
              <motion.div
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                className="w-20 h-20 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center shadow-2xl"
                style={{ boxShadow: '0 0 60px rgba(59,130,246,0.3)' }}
              >
                <Globe size={36} className="text-white" />
              </motion.div>
              <h1 className="text-4xl font-bold text-white mb-3">Start Your UX Audit</h1>
              <p className="text-slate-400 text-lg">Select an input source and let AI evaluate accessibility and design heuristics.</p>
            </div>

            {/* Segmented Modality Selector */}
            <div className="flex p-1.5 bg-slate-950/80 border border-white/[0.06] rounded-2xl mb-6 max-w-md mx-auto">
              {[
                { id: 'url', label: 'Website URL' },
                { id: 'screenshot', label: 'Screenshot Upload' },
                { id: 'figma', label: 'Figma File' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveModality(tab.id as any)}
                  className={`flex-1 py-2.5 text-xs font-semibold rounded-xl transition-all ${
                    activeModality === tab.id
                      ? 'bg-blue-600 text-white shadow-lg'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="glass-card p-8 rounded-3xl space-y-6">
              {/* MODALITY 1: Website URL */}
              {activeModality === 'url' && (
                <div className="space-y-4">
                  <div>
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
                  </div>

                  <div>
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
                </div>
              )}

              {/* MODALITY 2: Screenshot Ingestion */}
              {activeModality === 'screenshot' && (
                <div className="space-y-4">
                  <label className="block text-sm font-medium text-slate-300">Upload UI Screenshots</label>
                  
                  <div
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                    onClick={() => document.getElementById('screenshot-picker')?.click()}
                    className="border-2 border-dashed border-white/10 hover:border-blue-500/40 rounded-2xl p-8 flex flex-col items-center justify-center cursor-pointer transition-all bg-white/[0.01]"
                  >
                    <Zap className="text-blue-400 mb-3" size={32} />
                    <p className="text-sm font-medium text-slate-200">Drop screenshots here or click to upload</p>
                    <p className="text-xs text-slate-500 mt-1">Supports PNG, JPG, JPEG, WEBP (Max 10 files)</p>
                    <input
                      id="screenshot-picker"
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </div>

                  {screenshotError && <p className="text-sm text-red-400 flex items-center gap-1.5"><AlertCircle size={14} />{screenshotError}</p>}

                  {screenshotFiles.length > 0 && (
                    <div className="grid grid-cols-5 gap-3 mt-4">
                      {screenshotFiles.map((item, idx) => (
                        <div key={idx} className="relative group rounded-xl overflow-hidden border border-white/10 aspect-square bg-slate-900">
                          <img src={item.previewUrl} alt={`preview-${idx}`} className="w-full h-full object-cover" />
                          <button
                            onClick={() => removeFile(idx)}
                            className="absolute -top-1.5 -right-1.5 bg-red-600/90 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-all hover:bg-red-700 shadow-md"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"></path></svg>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="pt-2 flex justify-end">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={validateAndStart}
                      className="bg-gradient-button px-8 py-4 rounded-xl font-semibold text-white flex items-center gap-2 text-sm"
                      style={{ boxShadow: '0 0 20px rgba(59,130,246,0.3)' }}
                    >
                      <Search size={16} />
                      Analyze Screenshots
                    </motion.button>
                  </div>
                </div>
              )}

              {/* MODALITY 3: Figma Ingestion */}
              {activeModality === 'figma' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Figma File URL</label>
                    <input
                      type="text"
                      value={figmaUrl}
                      onChange={(e) => setFigmaUrl(e.target.value)}
                      placeholder="https://www.figma.com/file/..."
                      className="w-full px-4.5 py-4 rounded-xl text-white placeholder-slate-500 text-sm outline-none focus:ring-2 focus:ring-blue-500/40 transition-all"
                      style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Personal Access Token (Optional)</label>
                    <input
                      type="password"
                      value={figmaToken}
                      onChange={(e) => setFigmaToken(e.target.value)}
                      placeholder="figd_..."
                      className="w-full px-4.5 py-4 rounded-xl text-white placeholder-slate-500 text-sm outline-none focus:ring-2 focus:ring-blue-500/40 transition-all"
                      style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
                    />
                  </div>

                  {figmaError && <p className="text-sm text-red-400 flex items-center gap-1.5"><AlertCircle size={14} />{figmaError}</p>}

                  <div className="pt-2 flex justify-end">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={validateAndStart}
                      className="bg-gradient-button px-8 py-4 rounded-xl font-semibold text-white flex items-center gap-2 text-sm"
                      style={{ boxShadow: '0 0 20px rgba(59,130,246,0.3)' }}
                    >
                      <Search size={16} />
                      Import & Audit Figma
                    </motion.button>
                  </div>
                </div>
              )}

              {/* Multi-Agent toggle switch */}
              <div className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.02] border border-white/[0.04]">
                <div className="pr-4">
                  <p className="text-sm font-semibold text-slate-200">Enhance analysis with multi-agent review</p>
                  <p className="text-xs text-slate-500 mt-0.5">Launches 4 auxiliary specialist agents (UX Heuristic, A11y, Conversion, Consistency) to verify findings.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setEnhanceAnalysis(prev => !prev)}
                  className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out outline-none ${
                    enhanceAnalysis ? 'bg-blue-600' : 'bg-slate-800'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      enhanceAnalysis ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-4 border-t border-white/[0.06]">
                {['Multi-Source Ingestion', 'Gemini 2.5 Vision Analysis', "Nielsen's 10 Heuristics", 'WCAG 2.2 A/AA/AAA', 'Persona Satisfaction Scores', 'Revenue Impact Estimates', 'AI-Generated Code Fixes', 'Progress Tracking'].map((item) => (
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
