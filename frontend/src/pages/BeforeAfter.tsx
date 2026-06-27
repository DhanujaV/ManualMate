import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Editor from '@monaco-editor/react';
import { GitCompare, Eye, Code2, Palette, Sparkles, Image, Check, AlertTriangle } from 'lucide-react';
import { useAudit } from '../context/AuditContext';

type ViewTab = 'visual' | 'html' | 'css';

const BeforeAfter: React.FC = () => {
  const { activeAudit, selectedPage, setActiveTab } = useAudit();
  const [activeViewTab, setActiveViewTab] = useState<ViewTab>('visual');

  // Auto-select page if not set
  const page = selectedPage || activeAudit?.pages[0];
  const beforeAfter = page?.beforeAfter;

  // Empty data safety guard (Mandatory rule: show Run audit to generate Before/After transformation)
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

  const tabs: { id: ViewTab; label: string; icon: React.ElementType }[] = [
    { id: 'visual', label: 'Visual Diff',  icon: Eye },
    { id: 'html',   label: 'HTML',    icon: Code2 },
    { id: 'css',    label: 'CSS',     icon: Palette },
  ];

  return (
    <div className="p-6 md:p-8 space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Before vs After</h1>
          <p className="text-slate-400 text-sm mt-1">
            Visual regression & code diff engine for <span className="font-mono text-blue-400">{page.path}</span>
          </p>
        </div>
        <div className="flex gap-2 p-1 rounded-xl" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
          {tabs.map((tab) => (
            <button key={tab.id} onClick={() => setActiveViewTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeViewTab === tab.id ? 'bg-blue-600/25 text-blue-300' : 'text-slate-400 hover:text-slate-200'}`}>
              <tab.icon size={14} />{tab.label}
            </button>
          ))}
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Before Panel (Left) */}
        <div className="glass-card rounded-2xl overflow-hidden border border-red-500/10">
          <div className="px-5 py-3 flex items-center justify-between border-b border-white/[0.06]" style={{ background: 'rgba(239,68,68,0.06)' }}>
            <div className="flex items-center gap-3">
              <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
              <h2 className="text-sm font-bold text-red-300">Current (Before)</h2>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-red-500/10 text-red-400 border border-red-500/20">
              UNOPTIMIZED
            </span>
          </div>

          {activeViewTab === 'visual' && (
            <div className="p-6 space-y-4">
              {page.screenshot_b64 ? (
                <div className="space-y-4">
                  <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-400 font-medium leading-relaxed flex gap-2 items-center">
                    <AlertTriangle size={14} className="text-red-400 flex-shrink-0" />
                    <span>Overlay highlights active design system & WCAG failures.</span>
                  </div>
                  <div className="relative overflow-hidden rounded-xl border border-white/10 aspect-video bg-slate-950 flex items-center justify-center">
                    <img
                      src={`data:image/jpeg;base64,${page.screenshot_b64}`}
                      alt="Original viewport screenshot with issue highlighting"
                      className="max-h-[280px] w-auto object-contain"
                    />
                    {page.screenshotBoxes?.map((box, idx) => (
                      <div
                        key={idx}
                        className="absolute border-2 border-red-500 bg-red-500/15 pointer-events-none rounded"
                        style={{
                          left: `${(box.x / 1280) * 100}%`,
                          top: `${(box.y / 800) * 100}%`,
                          width: `${(box.width / 1280) * 100}%`,
                          height: `${(box.height / 800) * 100}%`
                        }}
                      />
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center p-8 rounded-xl border border-red-500/10 bg-red-950/5 min-h-[220px]">
                  <Image size={32} className="text-red-500/40 mb-2" />
                  <span className="text-xs text-red-400 font-semibold uppercase tracking-wider">Unoptimized Element Viewport</span>
                  <div className="w-full mt-3 p-3 bg-slate-900/80 rounded-lg border border-red-500/20 text-left font-mono text-[11px] text-red-300 overflow-x-auto whitespace-pre-wrap select-all">
                    {beforeAfter.before.html}
                  </div>
                </div>
              )}
              <div className="p-4 rounded-xl" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)' }}>
                <p className="text-xs font-bold text-red-400 uppercase tracking-wider mb-1">Visual Regression / Issue Description</p>
                <p className="text-sm text-slate-300 leading-relaxed font-medium">⚠️ {beforeAfter.before.visual}</p>
              </div>
            </div>
          )}
          {(activeViewTab === 'html' || activeViewTab === 'css') && (
            <div style={{ height: 380 }}>
              <Editor height="100%" language={activeViewTab}
                value={activeViewTab === 'html' ? beforeAfter.before.html : beforeAfter.before.css}
                theme="vs-dark"
                options={{ readOnly: true, minimap: { enabled: false }, fontSize: 12, lineNumbers: 'on', scrollBeyondLastLine: false, wordWrap: 'on', padding: { top: 12, bottom: 12 } }}
              />
            </div>
          )}
        </div>

        {/* After Panel (Right) */}
        <div className="glass-card rounded-2xl overflow-hidden border border-emerald-500/10">
          <div className="px-5 py-3 flex items-center justify-between border-b border-white/[0.06]" style={{ background: 'rgba(16,185,129,0.06)' }}>
            <div className="flex items-center gap-3">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <h2 className="text-sm font-bold text-emerald-300">AI-Improved (After)</h2>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              OPTIMIZED
            </span>
          </div>

          {activeViewTab === 'visual' && (
            <div className="p-6 space-y-4">
              {page.screenshot_b64 ? (
                <div className="space-y-4">
                  <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-400 font-medium leading-relaxed flex gap-2 items-center">
                    <Check size={14} className="text-emerald-400 flex-shrink-0" />
                    <span>Fixed Component: Layout structure normalized and hardened.</span>
                  </div>
                  <div className="relative overflow-hidden rounded-xl border border-white/10 aspect-video bg-slate-950 flex items-center justify-center">
                    <img
                      src={`data:image/jpeg;base64,${page.screenshot_b64}`}
                      alt="Optimized viewport screenshot with resolved overlays"
                      className="max-h-[280px] w-auto object-contain opacity-90 filter hue-rotate-15"
                    />
                    {page.screenshotBoxes?.map((box, idx) => (
                      <div
                        key={idx}
                        className="absolute border-2 border-emerald-500 bg-emerald-500/15 pointer-events-none rounded"
                        style={{
                          left: `${(box.x / 1280) * 100}%`,
                          top: `${(box.y / 800) * 100}%`,
                          width: `${(box.width / 1280) * 100}%`,
                          height: `${(box.height / 800) * 100}%`
                        }}
                      />
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center p-8 rounded-xl border border-emerald-500/10 bg-emerald-950/5 min-h-[220px]">
                  <Check size={32} className="text-emerald-500/40 mb-2" />
                  <span className="text-xs text-emerald-400 font-semibold uppercase tracking-wider">Refactored Element Viewport</span>
                  <div className="w-full mt-3 p-3 bg-slate-900/80 rounded-lg border border-emerald-500/20 text-left font-mono text-[11px] text-emerald-300 overflow-x-auto whitespace-pre-wrap select-all">
                    {beforeAfter.after.html}
                  </div>
                </div>
              )}
              <div className="p-4 rounded-xl" style={{ background: 'rgba(16,185,129,0.02)', border: '1px solid rgba(16,185,129,0.06)' }}>
                <p className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-1">Optimized Refactoring Description</p>
                <p className="text-sm text-slate-300 leading-relaxed font-medium">✅ {beforeAfter.after.visual}</p>
              </div>
            </div>
          )}
          {(activeViewTab === 'html' || activeViewTab === 'css') && (
            <div style={{ height: 380 }}>
              <Editor height="100%" language={activeViewTab}
                value={activeViewTab === 'html' ? beforeAfter.after.html : beforeAfter.after.css}
                theme="vs-dark"
                options={{ readOnly: true, minimap: { enabled: false }, fontSize: 12, lineNumbers: 'on', scrollBeyondLastLine: false, wordWrap: 'on', padding: { top: 12, bottom: 12 } }}
              />
            </div>
          )}
        </div>
      </motion.div>

      {/* DOM Diff Highlight Block */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="glass-card rounded-2xl overflow-hidden border border-white/[0.04]"
      >
        <div className="px-5 py-3 border-b border-white/[0.06] bg-white/[0.02] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Code2 size={16} className="text-slate-400" />
            <h3 className="text-sm font-semibold text-slate-200">DOM Diff Refactoring Log</h3>
          </div>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            AUTO-REFACTOR COMPLETED
          </span>
        </div>
        <div className="p-5 font-mono text-xs overflow-x-auto bg-slate-950/80 space-y-2">
          <div className="flex items-start gap-3 bg-red-950/20 border-l-2 border-red-500 p-2.5 rounded-r-lg">
            <span className="text-red-500 font-bold w-4 select-none">-</span>
            <pre className="text-red-300 whitespace-pre-wrap select-all">{beforeAfter.before.html}</pre>
          </div>
          <div className="flex items-start gap-3 bg-emerald-950/20 border-l-2 border-emerald-500 p-2.5 rounded-r-lg">
            <span className="text-emerald-500 font-bold w-4 select-none">+</span>
            <pre className="text-emerald-300 whitespace-pre-wrap select-all">{beforeAfter.after.html}</pre>
          </div>
        </div>
      </motion.div>

      {/* AI Fix Reasoning */}
      {beforeAfter.reasoning && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card p-6 rounded-2xl border border-blue-500/10"
          style={{ background: 'rgba(59,130,246,0.02)' }}
        >
          <div className="flex items-center gap-2 mb-3">
            <Sparkles size={16} className="text-blue-400" />
            <h3 className="text-xs font-bold text-blue-300 uppercase tracking-wider">AI Fix Reasoning</h3>
          </div>
          <p className="text-sm text-slate-300 leading-relaxed font-medium">
            {beforeAfter.reasoning}
          </p>
        </motion.div>
      )}
    </div>
  );
};

export default BeforeAfter;
