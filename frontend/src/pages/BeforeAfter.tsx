import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Editor from '@monaco-editor/react';
import {
  GitCompare, Eye, Code2, Palette, Sparkles, Image, Check, AlertTriangle
} from 'lucide-react';
import { useAudit } from '../context/AuditContext';

type ViewTab = 'visual' | 'html' | 'css';

const BeforeAfter: React.FC = () => {
  const { activeAudit, selectedPage, setActiveTab } = useAudit();
  const [activeViewTab, setActiveViewTab] = useState<ViewTab>('visual');
  const [selectedIssueId, setSelectedIssueId] = useState<string | null>(null);

  const tabs: { id: ViewTab; label: string; icon: React.ElementType }[] = [
    { id: 'visual', label: 'Visual Diff',  icon: Eye },
    { id: 'html',   label: 'HTML',    icon: Code2 },
    { id: 'css',    label: 'CSS',     icon: Palette },
  ];

  // Auto-select page fallback
  const page = selectedPage || activeAudit?.pages[0];
  const beforeAfter = page?.beforeAfter;
  const issues = beforeAfter?.issues ?? [];

  // Auto-select first issue when page changes
  useEffect(() => {
    if (issues.length > 0) {
      setSelectedIssueId(issues[0].id);
    } else {
      setSelectedIssueId(null);
    }
  }, [page, issues]);

  // Mandatory Safety Guard: If no audit run yet, show Run audit to generate Before/After transformation
  if (!activeAudit || !page || !beforeAfter) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4 min-h-[420px]">
        <GitCompare size={48} className="text-slate-600" />
        <p className="text-slate-400 text-lg font-medium">Run audit to generate Before/After transformation</p>
        <button
          onClick={() => setActiveTab('auditor')}
          className="bg-gradient-button px-6 py-3 rounded-xl text-sm font-semibold text-white"
        >
          Start an Audit
        </button>
      </div>
    );
  }

  // If page audit complete but zero issues found, show 'No UX issues detected'
  if (issues.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4 min-h-[420px]">
        <Check size={48} className="text-emerald-500 bg-emerald-500/10 p-2.5 rounded-full border border-emerald-500/20" />
        <p className="text-slate-300 text-lg font-semibold">No UX issues detected</p>
        <p className="text-slate-500 text-sm">This page aligns perfectly with WCAG and Usability heuristic rules.</p>
        <button
          onClick={() => setActiveTab('details')}
          className="px-5 py-2.5 rounded-xl border border-white/10 text-slate-300 text-xs hover:bg-white/[0.04] transition-all"
        >
          View Page Details
        </button>
      </div>
    );
  }

  // Find currently active issue
  const activeIssue = issues.find(i => i.id === selectedIssueId) || issues[0];

  // Helper to map severity color classes
  const getSeverityBadge = (severity: 'Critical' | 'Warning' | 'Minor') => {
    const config = {
      Critical: 'bg-red-500/10 text-red-400 border-red-500/25',
      Warning: 'bg-amber-500/10 text-amber-400 border-amber-500/25',
      Minor: 'bg-blue-500/10 text-blue-400 border-blue-500/25',
    };
    return config[severity] || config.Minor;
  };

  // Find screenshot bounding box for active issue only
  const activeBox = page.screenshotBoxes?.find(
    box => box.issue_id === activeIssue.id || activeIssue.id.includes(box.issue_id) || box.issue_id.includes(activeIssue.id)
  );

  return (
    <div className="p-6 md:p-8 space-y-6">
      {/* Title Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Before vs After</h1>
          <p className="text-slate-400 text-sm mt-1">
            Visual regression & code refactoring for <span className="font-mono text-blue-400">{page.path}</span> — <span className="text-slate-300 font-semibold">{issues.length} corrections available</span>
          </p>
        </div>
      </motion.div>

      {/* Main Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* 1. ISSUE LIST PANEL (LEFT SIDE - 4 cols) */}
        <motion.div
          initial={{ opacity: 0, x: -15 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-4 flex flex-col gap-3 max-h-[640px] overflow-y-auto pr-1"
        >
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider px-1">
            Select Detected Issue
          </div>
          {issues.map((issue) => {
            const isSelected = issue.id === activeIssue.id;
            return (
              <button
                key={issue.id}
                onClick={() => setSelectedIssueId(issue.id)}
                className={`w-full text-left p-4 rounded-2xl border transition-all flex flex-col gap-2.5 relative overflow-hidden ${
                  isSelected
                    ? 'bg-blue-600/15 border-blue-500/40 shadow-lg shadow-blue-500/5'
                    : 'glass-card border-white/[0.06] hover:border-white/15'
                }`}
              >
                {/* Selector active indicator bar */}
                {isSelected && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500" />
                )}
                
                {/* Card Header info */}
                <div className="flex items-start justify-between gap-2">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${getSeverityBadge(issue.severity)}`}>
                    {issue.severity}
                  </span>
                  <span className="text-[10px] font-mono text-slate-500">
                    {issue.element_selector}
                  </span>
                </div>

                {/* Title */}
                <h3 className={`text-sm font-bold leading-snug transition-colors ${isSelected ? 'text-white' : 'text-slate-300'}`}>
                  {issue.title}
                </h3>

                {/* Preview HTML Code snippet snippet */}
                <p className="text-[10px] font-mono text-slate-500 bg-slate-950/40 px-2 py-1.5 rounded border border-white/[0.03] truncate w-full">
                  {issue.before_html}
                </p>
              </button>
            );
          })}
        </motion.div>

        {/* 2. BEFORE / AFTER CODE VIEWER (RIGHT SIDE - 8 cols) */}
        <motion.div
          initial={{ opacity: 0, x: 15 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-8 space-y-6"
        >
          {/* Active Issue Header Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-4 p-4 glass-card rounded-2xl border border-white/[0.06]">
            <div className="flex items-center gap-2.5">
              <Sparkles size={16} className="text-blue-400" />
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-slate-400 leading-none">TARGET COMPONENT</span>
                <span className="text-sm font-bold text-white mt-1 font-mono">{activeIssue.element_selector}</span>
              </div>
            </div>

            {/* View Mode switcher tabs */}
            <div className="flex gap-1.5 p-1 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.04)' }}>
              {tabs.map((tab) => (
                <button key={tab.id} onClick={() => setActiveViewTab(tab.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${activeViewTab === tab.id ? 'bg-blue-600/25 text-blue-300 border border-blue-500/20' : 'text-slate-400 hover:text-slate-200 border border-transparent'}`}>
                  <tab.icon size={12} />{tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Code Viewer Side-by-Side Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Before (Left Panel) */}
            <div className="glass-card rounded-2xl overflow-hidden border border-red-500/10">
              <div className="px-5 py-3 flex items-center justify-between border-b border-white/[0.06]" style={{ background: 'rgba(239,68,68,0.06)' }}>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                  <h2 className="text-xs font-bold text-red-300 uppercase tracking-wider">Broken Layout (Before)</h2>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-red-500/10 text-red-400 border border-red-500/20">
                  FAILING
                </span>
              </div>

              {activeViewTab === 'visual' && (
                <div className="p-5 space-y-4">
                  {page.screenshot_b64 ? (
                    <div className="space-y-4">
                      <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-[11px] text-red-400 font-medium leading-normal flex gap-2 items-center">
                        <AlertTriangle size={12} className="text-red-400 flex-shrink-0" />
                        <span>Highlights failing region: {activeIssue.element_selector}</span>
                      </div>
                      <div className="relative overflow-hidden rounded-xl border border-white/10 aspect-video bg-slate-950 flex items-center justify-center">
                        <img
                          src={`data:image/jpeg;base64,${page.screenshot_b64}`}
                          alt="Broken viewport screenshot"
                          className="max-h-[220px] w-auto object-contain"
                        />
                        {activeBox && (
                          <div
                            className="absolute border-2 border-red-500 bg-red-500/20 pointer-events-none rounded shadow-[0_0_8px_rgba(239,68,68,0.4)]"
                            style={{
                              left: `${(activeBox.x / 1280) * 100}%`,
                              top: `${(activeBox.y / 800) * 100}%`,
                              width: `${(activeBox.width / 1280) * 100}%`,
                              height: `${(activeBox.height / 800) * 100}%`
                            }}
                          />
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center p-6 rounded-xl border border-red-500/10 bg-red-950/5 min-h-[180px]">
                      <Image size={28} className="text-red-500/40 mb-1.5" />
                      <span className="text-[10px] text-red-400 font-semibold uppercase tracking-wider">Extracted Unoptimized Node</span>
                      <div className="w-full mt-3 p-3 bg-slate-900/80 rounded-lg border border-red-500/20 text-left font-mono text-[10px] text-red-300 overflow-x-auto whitespace-pre-wrap select-all">
                        {activeIssue.before_html}
                      </div>
                    </div>
                  )}
                  <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                    <p className="text-[10px] font-bold text-red-400 uppercase tracking-wider mb-0.5">Problem Details</p>
                    <p className="text-xs text-slate-300 leading-relaxed font-medium">{activeIssue.ux_fix_explanation}</p>
                  </div>
                </div>
              )}

              {(activeViewTab === 'html' || activeViewTab === 'css') && (
                <div style={{ height: 320 }}>
                  <Editor height="100%" language={activeViewTab}
                    value={activeViewTab === 'html' ? activeIssue.before_html : '/* CSS unaffected or inherited */'}
                    theme="vs-dark"
                    options={{ readOnly: true, minimap: { enabled: false }, fontSize: 11, lineNumbers: 'on', scrollBeyondLastLine: false, wordWrap: 'on', padding: { top: 12, bottom: 12 } }}
                  />
                </div>
              )}
            </div>

            {/* After (Right Panel) */}
            <div className="glass-card rounded-2xl overflow-hidden border border-emerald-500/10">
              <div className="px-5 py-3 flex items-center justify-between border-b border-white/[0.06]" style={{ background: 'rgba(16,185,129,0.06)' }}>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <h2 className="text-xs font-bold text-emerald-300 uppercase tracking-wider">Refactored Layout (After)</h2>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  RECURRING RESOLVED
                </span>
              </div>

              {activeViewTab === 'visual' && (
                <div className="p-5 space-y-4">
                  {page.screenshot_b64 ? (
                    <div className="space-y-4">
                      <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-[11px] text-emerald-400 font-medium leading-normal flex gap-2 items-center">
                        <Check size={12} className="text-emerald-400 flex-shrink-0" />
                        <span>Coordinates successfully resolved: {activeIssue.element_selector}</span>
                      </div>
                      <div className="relative overflow-hidden rounded-xl border border-white/10 aspect-video bg-slate-950 flex items-center justify-center">
                        <img
                          src={`data:image/jpeg;base64,${page.screenshot_b64}`}
                          alt="Fixed viewport screenshot"
                          className="max-h-[220px] w-auto object-contain opacity-90 filter hue-rotate-15"
                        />
                        {activeBox && (
                          <div
                            className="absolute border-2 border-emerald-500 bg-emerald-500/20 pointer-events-none rounded shadow-[0_0_8px_rgba(16,185,129,0.4)]"
                            style={{
                              left: `${(activeBox.x / 1280) * 100}%`,
                              top: `${(activeBox.y / 800) * 100}%`,
                              width: `${(activeBox.width / 1280) * 100}%`,
                              height: `${(activeBox.height / 800) * 100}%`
                            }}
                          />
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center p-6 rounded-xl border border-emerald-500/10 bg-emerald-950/5 min-h-[180px]">
                      <Check size={28} className="text-emerald-500/40 mb-1.5" />
                      <span className="text-[10px] text-emerald-400 font-semibold uppercase tracking-wider">Dynamic Production Fix</span>
                      <div className="w-full mt-3 p-3 bg-slate-900/80 rounded-lg border border-emerald-500/20 text-left font-mono text-[10px] text-emerald-300 overflow-x-auto whitespace-pre-wrap select-all">
                        {activeIssue.after_html}
                      </div>
                    </div>
                  )}
                  <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                    <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider mb-0.5">Applied Refactoring Fixes</p>
                    <p className="text-xs text-slate-300 leading-relaxed font-medium">{activeIssue.accessibility_fix_notes || activeIssue.ux_fix_explanation}</p>
                  </div>
                </div>
              )}

              {(activeViewTab === 'html' || activeViewTab === 'css') && (
                <div style={{ height: 320 }}>
                  <Editor height="100%" language={activeViewTab}
                    value={activeViewTab === 'html' ? activeIssue.after_html : activeIssue.after_css}
                    theme="vs-dark"
                    options={{ readOnly: true, minimap: { enabled: false }, fontSize: 11, lineNumbers: 'on', scrollBeyondLastLine: false, wordWrap: 'on', padding: { top: 12, bottom: 12 } }}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Unified DOM Diff Log */}
          <div className="glass-card rounded-2xl overflow-hidden border border-white/[0.06]">
            <div className="px-5 py-3 border-b border-white/[0.06] bg-white/[0.02] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Code2 size={14} className="text-slate-400" />
                <span className="text-xs font-bold text-slate-200">Refactoring DOM Diff Log</span>
              </div>
              <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                DIFF APPLIED SUCCESSFULLY
              </span>
            </div>
            <div className="p-4 font-mono text-[10px] overflow-x-auto bg-slate-950/80 space-y-1.5">
              <div className="flex items-start gap-2 bg-red-950/15 border-l-2 border-red-500 p-2 rounded-r-lg">
                <span className="text-red-500 font-bold w-3 select-none">-</span>
                <pre className="text-red-300 whitespace-pre-wrap select-all">{activeIssue.before_html}</pre>
              </div>
              <div className="flex items-start gap-2 bg-emerald-950/15 border-l-2 border-emerald-500 p-2 rounded-r-lg">
                <span className="text-emerald-500 font-bold w-3 select-none">+</span>
                <pre className="text-emerald-300 whitespace-pre-wrap select-all">{activeIssue.after_html}</pre>
              </div>
            </div>
          </div>

          {/* Bottom AI Explanations */}
          <div className="glass-card p-5 rounded-2xl border border-blue-500/10 bg-blue-950/[0.02] space-y-3.5">
            <div className="flex items-center gap-2 pb-2 border-b border-white/[0.04]">
              <Sparkles size={14} className="text-blue-400" />
              <h3 className="text-xs font-bold text-blue-300 uppercase tracking-wider">AI Fix Reasoning</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
              <div className="space-y-1">
                <span className="font-semibold text-slate-400 block uppercase tracking-tight text-[10px]">UX Optimization Impact</span>
                <p className="text-slate-200 leading-relaxed">{activeIssue.ux_fix_explanation}</p>
              </div>
              {activeIssue.accessibility_fix_notes && (
                <div className="space-y-1">
                  <span className="font-semibold text-slate-400 block uppercase tracking-tight text-[10px]">Accessibility Fix Details</span>
                  <p className="text-slate-200 leading-relaxed">{activeIssue.accessibility_fix_notes}</p>
                </div>
              )}
            </div>
          </div>
        </motion.div>

      </div>
    </div>
  );
};

export default BeforeAfter;
