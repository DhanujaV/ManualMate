import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Editor from '@monaco-editor/react';
import { GitCompare, Eye, Code2, Palette } from 'lucide-react';
import { useAudit } from '../context/AuditContext';

type ViewTab = 'visual' | 'html' | 'css';

const BeforeAfter: React.FC = () => {
  const { selectedPage, setActiveTab } = useAudit();
  const [activeViewTab, setActiveViewTab] = useState<ViewTab>('html');

  if (!selectedPage) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4">
        <GitCompare size={48} className="text-slate-600" />
        <p className="text-slate-400">Select a page from Page Details to compare before and after.</p>
        <button onClick={() => setActiveTab('details')}
          className="bg-gradient-button px-6 py-3 rounded-xl text-sm font-semibold text-white">
          Go to Page Details
        </button>
      </div>
    );
  }

  const { beforeAfter } = selectedPage;
  const tabs: { id: ViewTab; label: string; icon: React.ElementType }[] = [
    { id: 'visual', label: 'Visual',  icon: Eye },
    { id: 'html',   label: 'HTML',    icon: Code2 },
    { id: 'css',    label: 'CSS',     icon: Palette },
  ];

  return (
    <div className="p-6 md:p-8 space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Before vs After</h1>
          <p className="text-slate-400 text-sm mt-1">
            AI-generated improvements for <span className="font-mono text-blue-400">{selectedPage.path}</span>
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

        {/* Before */}
        <div className="glass-card rounded-2xl overflow-hidden">
          <div className="px-5 py-3 flex items-center gap-3 border-b border-white/[0.06]" style={{ background: 'rgba(239,68,68,0.06)' }}>
            <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
            <h2 className="text-sm font-semibold text-red-300">Current (Before)</h2>
          </div>

          {activeViewTab === 'visual' && (
            <div className="p-6">
              <div className="p-4 rounded-xl mb-4" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)' }}>
                <p className="text-sm text-slate-300 leading-relaxed italic">{beforeAfter.before.visual || 'No visual description available.'}</p>
              </div>
              <div className="space-y-2 opacity-60">
                <div className="h-10 rounded bg-red-500/10 border border-red-500/10" />
                <div className="h-6 w-3/4 rounded bg-white/[0.03]" />
                <div className="h-6 w-1/2 rounded bg-white/[0.02]" />
                <div className="h-8 w-32 rounded" style={{ background: 'rgba(220,38,38,0.5)' }} />
              </div>
            </div>
          )}
          {(activeViewTab === 'html' || activeViewTab === 'css') && (
            <div style={{ height: 400 }}>
              <Editor height="100%" language={activeViewTab}
                value={activeViewTab === 'html' ? beforeAfter.before.html : beforeAfter.before.css}
                theme="vs-dark"
                options={{ readOnly: true, minimap: { enabled: false }, fontSize: 12, lineNumbers: 'on', scrollBeyondLastLine: false, wordWrap: 'on', padding: { top: 12, bottom: 12 } }}
              />
            </div>
          )}
        </div>

        {/* After */}
        <div className="glass-card rounded-2xl overflow-hidden">
          <div className="px-5 py-3 flex items-center gap-3 border-b border-white/[0.06]" style={{ background: 'rgba(16,185,129,0.06)' }}>
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <h2 className="text-sm font-semibold text-emerald-300">AI-Improved (After)</h2>
          </div>

          {activeViewTab === 'visual' && (
            <div className="p-6">
              <div className="p-4 rounded-xl mb-4" style={{ background: 'rgba(16,185,129,0.04)', border: '1px solid rgba(16,185,129,0.1)' }}>
                <p className="text-sm text-slate-300 leading-relaxed italic">{beforeAfter.after.visual || 'No visual description available.'}</p>
              </div>
              <div className="space-y-2">
                <div className="h-10 rounded-xl" style={{ background: 'rgba(59,130,246,0.15)', border: '1px solid rgba(59,130,246,0.2)', backdropFilter: 'blur(4px)' }} />
                <div className="h-6 w-3/4 rounded bg-white/[0.06]" />
                <div className="h-6 w-1/2 rounded bg-white/[0.04]" />
                <div className="h-10 w-36 rounded-xl" style={{ background: 'linear-gradient(135deg, #1d5cff, #8b5cf6)' }} />
              </div>
            </div>
          )}
          {(activeViewTab === 'html' || activeViewTab === 'css') && (
            <div style={{ height: 400 }}>
              <Editor height="100%" language={activeViewTab}
                value={activeViewTab === 'html' ? beforeAfter.after.html : beforeAfter.after.css}
                theme="vs-dark"
                options={{ readOnly: true, minimap: { enabled: false }, fontSize: 12, lineNumbers: 'on', scrollBeyondLastLine: false, wordWrap: 'on', padding: { top: 12, bottom: 12 } }}
              />
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default BeforeAfter;
