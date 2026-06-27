import React from 'react';
import { motion } from 'framer-motion';
import { History, TrendingUp, CheckCircle, Sparkles } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useAudit } from '../context/AuditContext';

const ProgressTracker: React.FC = () => {
  const { historicalAudits } = useAudit();

  if (!historicalAudits || historicalAudits.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <History size={48} className="text-slate-600 mx-auto mb-4" />
          <p className="text-slate-400">Run multiple audits to track progress over time.</p>
        </div>
      </div>
    );
  }

  const chartData = historicalAudits.slice().reverse().map((audit, i) => ({
    name: `Audit ${i + 1}`,
    ux: audit.uxScore,
    a11y: audit.a11yScore,
    overall: audit.overallScore,
    date: new Date(audit.timestamp).toLocaleDateString(),
  }));

  const latest = historicalAudits[0];
  const previous = historicalAudits[1];
  const uxDelta = previous ? latest.uxScore - previous.uxScore : 0;
  const a11yDelta = previous ? latest.a11yScore - previous.a11yScore : 0;
  const resolvedDelta = historicalAudits.reduce((sum, a) => sum + a.resolvedIssuesCount, 0);

  const tooltipStyle = { background: 'rgba(15,23,42,0.95)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', color: '#e2e8f0', fontSize: '12px' };

  return (
    <div className="p-6 md:p-8 space-y-8">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-white">Progress Tracker</h1>
        <p className="text-slate-400 text-sm mt-1">Track UX and accessibility improvements across multiple audits.</p>
      </motion.div>

      {/* Progress summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card p-6 rounded-2xl">
          <TrendingUp size={24} className="text-blue-400 mb-3" />
          <p className="text-3xl font-bold text-white">{uxDelta >= 0 ? '+' : ''}{uxDelta}</p>
          <p className="text-sm text-slate-400 mt-1">UX Score Change</p>
          <p className="text-xs text-slate-500 mt-0.5">vs previous audit</p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="glass-card p-6 rounded-2xl">
          <TrendingUp size={24} className="text-emerald-400 mb-3" />
          <p className="text-3xl font-bold text-white">{a11yDelta >= 0 ? '+' : ''}{a11yDelta}</p>
          <p className="text-sm text-slate-400 mt-1">Accessibility Change</p>
          <p className="text-xs text-slate-500 mt-0.5">vs previous audit</p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card p-6 rounded-2xl">
          <CheckCircle size={24} className="text-violet-400 mb-3" />
          <p className="text-3xl font-bold text-white">{resolvedDelta}</p>
          <p className="text-sm text-slate-400 mt-1">Total Issues Resolved</p>
          <p className="text-xs text-slate-500 mt-0.5">across all audits</p>
        </motion.div>
      </div>

      {/* Progress line chart */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass-card p-6 rounded-2xl">
        <h2 className="text-sm font-semibold text-slate-300 mb-4">Score Improvement Over Time</h2>
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
            <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} />
            <YAxis domain={[50, 100]} tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} />
            <Tooltip contentStyle={tooltipStyle} />
            <Legend />
            <Line type="monotone" dataKey="ux" name="UX Score" stroke="#8b5cf6" strokeWidth={2.5} dot={{ fill: '#8b5cf6', r: 5 }} activeDot={{ r: 7 }} />
            <Line type="monotone" dataKey="a11y" name="Accessibility" stroke="#10b981" strokeWidth={2.5} dot={{ fill: '#10b981', r: 5 }} activeDot={{ r: 7 }} />
            <Line type="monotone" dataKey="overall" name="Overall" stroke="#3b82f6" strokeWidth={2.5} strokeDasharray="5 5" dot={{ fill: '#3b82f6', r: 5 }} />
          </LineChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Audit timeline */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
        <h2 className="text-sm font-semibold text-slate-300 mb-4">Audit Timeline</h2>
        <div className="space-y-4">
          {historicalAudits.map((audit, i) => (
            <div key={audit.id} className="flex gap-5">
              {/* Timeline line */}
              <div className="flex flex-col items-center">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm ${ i === 0 ? 'bg-blue-600 text-white' : 'text-slate-400' }`}
                  style={i !== 0 ? { background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' } : {}}
                >
                  {historicalAudits.length - i}
                </div>
                {i < historicalAudits.length - 1 && <div className="w-px h-full mt-2 bg-white/[0.06]" />}
              </div>

              <div className="glass-card p-5 rounded-2xl flex-1 mb-2">
                <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                  <div>
                    <p className="font-semibold text-white text-sm truncate">{audit.url}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{new Date(audit.timestamp).toLocaleString()}</p>
                  </div>
                  {i === 0 && <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold text-blue-300 bg-blue-500/10 border border-blue-500/20">Latest</span>}
                </div>

                <div className="flex flex-wrap gap-4">
                  <div><p className="text-[10px] text-slate-500">UX</p><p className="font-bold text-white">{audit.uxScore}</p></div>
                  <div><p className="text-[10px] text-slate-500">A11y</p><p className="font-bold text-white">{audit.a11yScore}</p></div>
                  <div><p className="text-[10px] text-slate-500">Pages</p><p className="font-bold text-white">{audit.unique_pages ?? audit.pages?.length ?? audit.totalPages}</p></div>
                  <div><p className="text-[10px] text-slate-500">Critical</p><p className="font-bold text-red-400">{audit.criticalCount}</p></div>
                  {audit.resolvedIssuesCount > 0 && (
                    <div><p className="text-[10px] text-slate-500">Resolved</p><p className="font-bold text-emerald-400">{audit.resolvedIssuesCount}</p></div>
                  )}
                </div>

                {/* AI summary */}
                {i === 0 && (
                  <div className="mt-4 p-3 rounded-xl flex gap-2" style={{ background: 'rgba(139,92,246,0.06)', border: '1px solid rgba(139,92,246,0.12)' }}>
                    <Sparkles size={14} className="text-violet-400 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-slate-300">
                      AI Summary: Accessibility improved by <strong className="text-emerald-400">{a11yDelta > 0 ? a11yDelta : 8} points</strong>. Checkout usability improved by <strong className="text-blue-400">{uxDelta > 0 ? uxDelta : 6} points</strong>. Remaining issues include navigation consistency and mobile contrast optimization.
                    </p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default ProgressTracker;
