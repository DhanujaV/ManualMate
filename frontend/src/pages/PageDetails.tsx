import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FileSearch, ChevronDown, ChevronUp, ExternalLink } from 'lucide-react';
import { useAudit } from '../context/AuditContext';
import IssueBadge from '../components/IssueBadge';
import ScoreRing from '../components/ScoreRing';

const PageDetails: React.FC = () => {
  const { activeAudit, selectedPage, setSelectedPage, generateFixForIssue, setActiveTab } = useAudit();
  const [expandedIssue, setExpandedIssue] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<'ux' | 'a11y'>('ux');

  if (!activeAudit) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4">
        <FileSearch size={48} className="text-slate-600" />
        <p className="text-slate-400 text-lg">Run a website audit to generate insights</p>
        <button
          onClick={() => setActiveTab('auditor')}
          className="bg-gradient-button px-6 py-3 rounded-xl text-sm font-semibold text-white"
        >
          Start an Audit
        </button>
      </div>
    );
  }

  if (!selectedPage) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <FileSearch size={48} className="text-slate-600 mx-auto mb-4" />
          <p className="text-slate-400">Select a page from the Site Structure to view details.</p>
        </div>
      </div>
    );
  }

  const allIssues = [
    ...selectedPage.uxIssues.map(i => ({ ...i, type: 'ux' })),
    ...selectedPage.a11yIssues.map(i => ({ ...i, type: 'a11y' }))
  ];

  const displayedIssues = activeSection === 'ux'
    ? selectedPage.uxIssues.map(i => ({ ...i, type: 'ux' }))
    : selectedPage.a11yIssues.map(i => ({ ...i, type: 'a11y' }));

  return (
    <div className="p-6 md:p-8 space-y-6">
      {/* Header with page selector */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">{selectedPage.title}</h1>
          <p className="text-slate-400 text-sm mt-1 font-mono flex items-center gap-1.5">
            {selectedPage.url}
            <ExternalLink size={12} className="text-slate-500" />
          </p>
        </div>
        <select
          className="px-4 py-2 rounded-xl text-sm text-slate-300 outline-none"
          style={{ background: 'rgba(15,23,42,0.8)', border: '1px solid rgba(255,255,255,0.08)' }}
          value={selectedPage.url}
          onChange={(e) => {
            const page = activeAudit.pages.find(p => p.url === e.target.value);
            if (page) setSelectedPage(page);
          }}
        >
          {activeAudit.pages.map((p) => (
            <option key={p.url} value={p.url}>{p.title} ({p.path})</option>
          ))}
        </select>
      </motion.div>

      {/* Score cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }} className="glass-card p-5 rounded-2xl flex flex-col items-center">
          <ScoreRing score={selectedPage.uxScore} size={80} />
          <p className="text-xs text-slate-400 mt-2">UX Score</p>
        </motion.div>
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.15 }} className="glass-card p-5 rounded-2xl flex flex-col items-center">
          <ScoreRing score={selectedPage.a11yScore} size={80} color="#10b981" />
          <p className="text-xs text-slate-400 mt-2">Accessibility</p>
        </motion.div>
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }} className="glass-card p-5 rounded-2xl flex flex-col items-center">
          <div className="text-3xl font-bold text-rose-400 mb-2">{selectedPage.uxIssues.filter(i => i.severity === 'Critical').length + selectedPage.a11yIssues.filter(i => i.severity === 'Critical').length}</div>
          <p className="text-xs text-slate-400">Critical Issues</p>
        </motion.div>
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.25 }} className="glass-card p-5 rounded-2xl flex flex-col items-center">
          <div className="text-3xl font-bold text-amber-400 mb-2">{allIssues.length}</div>
          <p className="text-xs text-slate-400">Total Issues</p>
        </motion.div>
      </div>

      {/* Screenshot annotation & Issues panel */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Annotated Screenshot */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }} className="glass-card rounded-2xl overflow-hidden">
          <div className="px-5 py-4 border-b border-white/[0.06]">
            <h2 className="text-sm font-semibold text-white">Screenshot Annotation</h2>
          </div>
          <div className="relative" style={{ aspectRatio: '16/9', background: 'rgba(5,10,30,0.8)' }}>
            {/* Mock page wireframe */}
            <div className="absolute inset-4 rounded-lg overflow-hidden" style={{ background: 'rgba(15,23,42,0.5)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div className="h-8 border-b border-white/[0.06] flex items-center px-3 gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500/40" />
                <div className="w-2.5 h-2.5 rounded-full bg-amber-500/40" />
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/40" />
                <div className="flex-1 mx-4 h-4 rounded bg-white/[0.04]" />
              </div>
              <div className="p-3 space-y-2">
                <div className="h-16 rounded bg-blue-500/10 border border-blue-500/10" />
                <div className="grid grid-cols-3 gap-2">
                  <div className="h-8 rounded bg-white/[0.04]" />
                  <div className="h-8 rounded bg-white/[0.04]" />
                  <div className="h-8 rounded bg-white/[0.04]" />
                </div>
                <div className="h-6 w-2/3 rounded bg-white/[0.03]" />
                <div className="h-4 rounded bg-white/[0.02]" />
                <div className="h-4 w-4/5 rounded bg-white/[0.02]" />
              </div>
            </div>

            {/* Bounding box overlays */}
            {selectedPage.screenshotBoxes.map((box) => {
              const scale = 0.28;
              const borderColor = box.severity === 'Critical' ? '#ef4444' : box.severity === 'Warning' ? '#f59e0b' : '#3b82f6';
              return (
                <div
                  key={box.issue_id}
                  title={box.label}
                  style={{
                    position: 'absolute',
                    left: `${box.x * scale + 14}px`,
                    top: `${box.y * scale + 14}px`,
                    width: `${box.width * scale}px`,
                    height: `${box.height * scale}px`,
                    border: `2px solid ${borderColor}`,
                    borderRadius: '4px',
                    background: `${borderColor}15`,
                    cursor: 'pointer',
                    zIndex: 10,
                  }}
                >
                  <span
                    style={{
                      position: 'absolute',
                      top: -18,
                      left: 0,
                      background: borderColor,
                      color: '#fff',
                      fontSize: 8,
                      padding: '1px 4px',
                      borderRadius: 3,
                      whiteSpace: 'nowrap',
                      fontWeight: 600
                    }}
                  >
                    {box.label}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Legend */}
          <div className="flex gap-4 px-5 py-3">
            {(['Critical', 'Warning', 'Minor'] as const).map((sev) => (
              <div key={sev} className="flex items-center gap-1.5">
                <div className={`w-3 h-1.5 rounded-full ${ sev === 'Critical' ? 'bg-red-500' : sev === 'Warning' ? 'bg-amber-500' : 'bg-blue-500' }`} />
                <span className="text-[10px] text-slate-400">{sev}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Issues List */}
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.35 }} className="glass-card rounded-2xl overflow-hidden">
          <div className="px-5 py-4 border-b border-white/[0.06]">
            <div className="flex gap-3">
              <button
                onClick={() => setActiveSection('ux')}
                className={`text-sm font-medium px-3 py-1 rounded-lg transition-all ${ activeSection === 'ux' ? 'bg-blue-500/15 text-blue-300' : 'text-slate-400 hover:text-slate-200' }`}
              >
                UX Issues ({selectedPage.uxIssues.length})
              </button>
              <button
                onClick={() => setActiveSection('a11y')}
                className={`text-sm font-medium px-3 py-1 rounded-lg transition-all ${ activeSection === 'a11y' ? 'bg-emerald-500/15 text-emerald-300' : 'text-slate-400 hover:text-slate-200' }`}
              >
                Accessibility ({selectedPage.a11yIssues.length})
              </button>
            </div>
          </div>

          <div className="divide-y divide-white/[0.04] overflow-y-auto" style={{ maxHeight: 420 }}>
            {displayedIssues.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-slate-500 text-sm">No issues detected on this page for this category. ✓</p>
              </div>
            ) : displayedIssues.map((issue) => (
              <div key={issue.id} className="p-4">
                <div
                  className="flex items-start justify-between gap-3 cursor-pointer"
                  onClick={() => setExpandedIssue(expandedIssue === issue.id ? null : issue.id)}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                      <IssueBadge severity={issue.severity} size="sm" />
                      <span className="text-[10px] text-slate-500">{issue.heuristic || issue.standard}</span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">{issue.description}</p>
                  </div>
                  {expandedIssue === issue.id ? <ChevronUp size={14} className="text-slate-500 flex-shrink-0 mt-0.5" /> : <ChevronDown size={14} className="text-slate-500 flex-shrink-0 mt-0.5" />}
                </div>

                {expandedIssue === issue.id && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="mt-3 space-y-3"
                  >
                    {issue.element && (
                      <div className="px-3 py-2 rounded-lg text-xs font-mono text-violet-300" style={{ background: 'rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.15)' }}>
                        {issue.element}
                      </div>
                    )}
                    <div className="px-3 py-2 rounded-lg" style={{ background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.1)' }}>
                      <p className="text-[10px] text-emerald-400 font-semibold mb-1">RECOMMENDATION</p>
                      <p className="text-xs text-slate-300">{issue.recommendation}</p>
                    </div>
                    <button
                      onClick={() => generateFixForIssue(selectedPage.url, issue.id)}
                      className="bg-gradient-button px-4 py-2 rounded-lg text-xs font-semibold text-white"
                    >
                      Generate Fix →
                    </button>
                  </motion.div>
                )}
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default PageDetails;
