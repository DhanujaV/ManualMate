import React from 'react';
import { motion } from 'framer-motion';
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis,
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, CartesianGrid, Legend
} from 'recharts';
import { Shield, Zap, Globe, AlertTriangle, TrendingUp, BarChart3 } from 'lucide-react';
import { useAudit } from '../context/AuditContext';
import ScoreRing from '../components/ScoreRing';

const OverallDashboard: React.FC = () => {
  const { activeAudit, setActiveTab } = useAudit();

  if (!activeAudit) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4">
        <BarChart3 size={48} className="text-slate-600" />
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

  const severityData = [
    { name: 'Critical', value: activeAudit.criticalCount, color: '#ef4444' },
    { name: 'Warning',  value: activeAudit.warningCount,  color: '#f59e0b' },
    { name: 'Minor',    value: activeAudit.minorCount,    color: '#3b82f6' },
  ];

  const categoryData = activeAudit.pages.slice(0, 6).map((p) => ({
    name: p.path === '/' ? 'Home' : p.path.replace('/', '').slice(0, 10),
    ux: p.uxScore,
    a11y: p.a11yScore,
  }));

  const personaData = ['First-time', 'Elderly', 'Power User', 'Visually Imp.', 'Frequent'].map((name, i) => ({
    name,
    score: activeAudit.pages[0]?.personas[i]?.score ?? 70 + i * 4,
  }));

  const metricCards = [
    { label: 'Overall Score',   value: activeAudit.overallScore,   icon: BarChart3,     color: 'from-blue-500 to-violet-500',   unit: '/100' },
    { label: 'UX Score',        value: activeAudit.uxScore,        icon: Zap,           color: 'from-violet-500 to-purple-600', unit: '/100' },
    { label: 'Accessibility',   value: activeAudit.a11yScore,      icon: Shield,        color: 'from-emerald-500 to-teal-600',  unit: '/100' },
    { label: 'Unique Pages',    value: activeAudit.unique_pages ?? activeAudit.pages?.length ?? activeAudit.totalPages,     icon: Globe,         color: 'from-sky-500 to-blue-600',      unit: '' },
    { label: 'Critical Issues', value: activeAudit.criticalCount,  icon: AlertTriangle, color: 'from-red-500 to-rose-600',      unit: '' },
    { label: 'Avg Page Score',  value: Math.round(activeAudit.pages.reduce((s, p) => s + p.uxScore, 0) / Math.max(1, activeAudit.pages.length)), icon: TrendingUp, color: 'from-amber-500 to-orange-600', unit: '/100' },
  ];

  const tooltipStyle = {
    background: 'rgba(15,23,42,0.95)', border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '12px', color: '#e2e8f0', fontSize: '12px',
  };

  return (
    <div className="p-6 md:p-8 space-y-8">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-white">Overall Dashboard</h1>
        <p className="text-slate-400 text-sm mt-1">Audit results for <span className="text-blue-400 font-mono">{activeAudit.url}</span></p>
      </motion.div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {metricCards.map((card, i) => (
          <motion.div key={card.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
            className="glass-card p-5 rounded-2xl flex flex-col items-center text-center">
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center mb-3`}>
              <card.icon size={18} className="text-white" />
            </div>
            <p className="text-2xl font-bold text-white">{card.value}<span className="text-slate-400 text-sm">{card.unit}</span></p>
            <p className="text-xs text-slate-400 mt-1">{card.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Screenshot-Based Insights Card */}
      {activeAudit.source === 'screenshot' && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
          className="glass-card p-6 rounded-2xl border border-blue-500/20 bg-blue-950/5">
          <div className="flex items-center gap-3 mb-4">
            <Zap className="text-blue-400" size={20} />
            <h2 className="text-lg font-bold text-white">Screenshot-Based Insights</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Detected UI Type</p>
                <p className="text-lg font-bold text-blue-300 mt-0.5 capitalize">{(activeAudit as any).layout_type || 'landing page'}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-2">Visible UI Components</p>
                <div className="flex flex-wrap gap-2">
                  {((activeAudit as any).components || []).map((comp: any, idx: number) => (
                    <span key={idx} className="px-3 py-1 rounded-lg text-xs font-semibold bg-white/5 border border-white/10 text-slate-300">
                      {comp.label} ({comp.type})
                    </span>
                  ))}
                  {!((activeAudit as any).components) || (activeAudit as any).components.length === 0 && (
                    <span className="text-xs text-slate-500 italic">No components indexed.</span>
                  )}
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-2">Key Usability & Accessibility Issues</p>
                <div className="space-y-2">
                  {activeAudit.pages.flatMap(p => [...p.uxIssues, ...p.a11yIssues]).slice(0, 3).map((iss, idx) => (
                    <div key={idx} className="p-3 rounded-xl bg-slate-900/50 border border-white/[0.04] flex items-start gap-2.5">
                      <AlertTriangle size={14} className="text-amber-400 mt-0.5 flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-white truncate">{iss.description}</p>
                        <p className="text-[10px] text-slate-500 mt-0.5">Component: {iss.element} | Severity: {iss.severity}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Score Rings */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass-card p-6 rounded-2xl">
        <h2 className="text-sm font-semibold text-slate-300 mb-6">Score Overview</h2>
        <div className="flex flex-wrap justify-around gap-6">
          <ScoreRing score={activeAudit.overallScore} size={100} label="Overall" />
          <ScoreRing score={activeAudit.uxScore}      size={100} label="UX"            color="#8b5cf6" />
          <ScoreRing score={activeAudit.a11yScore}    size={100} label="Accessibility"  color="#10b981" />
          <ScoreRing score={Math.max(0, 100 - activeAudit.criticalCount * 10)} size={100} label="Issue-Free" color="#f59e0b" />
        </div>
      </motion.div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="glass-card p-6 rounded-2xl">
          <h2 className="text-sm font-semibold text-slate-300 mb-4">Severity Distribution</h2>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={severityData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} dataKey="value" paddingAngle={4}>
                {severityData.map((entry, idx) => <Cell key={idx} fill={entry.color} />)}
              </Pie>
              <Tooltip contentStyle={tooltipStyle} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }} className="glass-card p-6 rounded-2xl">
          <h2 className="text-sm font-semibold text-slate-300 mb-4">UX vs Accessibility by Page</h2>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={categoryData} barGap={2}>
              <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis domain={[0, 100]} tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="ux"   name="UX Score"  fill="#8b5cf6" radius={[4,4,0,0]} />
              <Bar dataKey="a11y" name="A11y Score" fill="#10b981" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="glass-card p-6 rounded-2xl">
          <h2 className="text-sm font-semibold text-slate-300 mb-4">Persona Satisfaction</h2>
          <ResponsiveContainer width="100%" height={220}>
            <RadarChart data={personaData}>
              <PolarGrid stroke="rgba(255,255,255,0.06)" />
              <PolarAngleAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 10 }} />
              <Radar name="Score" dataKey="score" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.15} />
              <Tooltip contentStyle={tooltipStyle} />
            </RadarChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55 }} className="glass-card p-6 rounded-2xl">
          <h2 className="text-sm font-semibold text-slate-300 mb-4">Score Progress History</h2>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={activeAudit.historyScores}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="timestamp" tick={{ fill: '#94a3b8', fontSize: 10 }} axisLine={false} />
              <YAxis domain={[50, 100]} tick={{ fill: '#94a3b8', fontSize: 10 }} axisLine={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend />
              <Line type="monotone" dataKey="uxScore"   name="UX"    stroke="#8b5cf6" strokeWidth={2} dot={{ fill: '#8b5cf6', r: 4 }} />
              <Line type="monotone" dataKey="a11yScore" name="A11y"  stroke="#10b981" strokeWidth={2} dot={{ fill: '#10b981', r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>
      </div>
    </div>
  );
};

export default OverallDashboard;
