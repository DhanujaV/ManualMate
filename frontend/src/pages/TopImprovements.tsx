import React from 'react';
import { motion } from 'framer-motion';
import { Zap, AlertTriangle, TrendingUp, Clock, ChevronRight } from 'lucide-react';
import { useAudit } from '../context/AuditContext';
import IssueBadge from '../components/IssueBadge';

const TopImprovements: React.FC = () => {
  const { activeAudit, setSelectedPage, generateFixForIssue, setActiveTab } = useAudit();

  if (!activeAudit) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4">
        <Zap size={48} className="text-slate-600" />
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

  // Build top improvements from all pages' issues
  type Improvement = {
    rank: number;
    page: string;
    pageTitle: string;
    pageUrl: string;
    issue: string;
    severity: 'Critical' | 'Warning' | 'Minor';
    standard: string;
    businessImpact: string;
    fixTime: string;
    uxGain: string;
    a11yGain: string;
    issueId: string;
  };

  const top3: Improvement[] = (activeAudit.topImprovements || []).map((item: any) => ({
    rank: item.rank,
    page: item.page,
    pageTitle: item.pageTitle,
    pageUrl: item.pageUrl,
    issue: item.issue,
    severity: item.severity,
    standard: item.standard,
    businessImpact: item.businessImpact,
    fixTime: item.fixTime,
    uxGain: item.uxGain,
    a11yGain: item.a11yGain,
    issueId: item.issueId
  }));

  const rankColors = ['from-red-500 to-rose-600', 'from-amber-500 to-orange-600', 'from-blue-500 to-indigo-600'];
  const rankGlow = ['rgba(239,68,68,0.2)', 'rgba(245,158,11,0.2)', 'rgba(59,130,246,0.2)'];
  const impactColors: Record<string, string> = { High: 'text-red-400 bg-red-500/10 border-red-500/20', Medium: 'text-amber-400 bg-amber-500/10 border-amber-500/20', Low: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' };

  if (top3.length === 0) {
    return (
      <div className="p-6 md:p-8 space-y-6">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl font-bold text-white">Top 3 Priority Improvements</h1>
          <p className="text-slate-400 text-sm mt-1">The highest-impact fixes ranked by business value and severity.</p>
        </motion.div>
        <div className="flex flex-col items-center justify-center p-12 text-slate-400 glass-card rounded-3xl min-h-[180px]" style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.06)' }}>
          <p className="text-sm font-semibold">No high-priority improvements detected.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-white">Top 3 Priority Improvements</h1>
        <p className="text-slate-400 text-sm mt-1">The highest-impact fixes ranked by business value and severity.</p>
      </motion.div>

      <div className="space-y-5">
        {top3.map((item, i) => (
          <motion.div
            key={item.issueId}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.15 }}
            className="glass-card p-6 rounded-3xl"
            style={{ boxShadow: `0 0 40px ${rankGlow[i]}` }}
          >
            <div className="flex flex-wrap items-start gap-5">
              {/* Rank badge */}
              <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${rankColors[i]} flex items-center justify-center flex-shrink-0 shadow-lg font-black text-white text-2xl`}>
                #{item.rank}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <IssueBadge severity={item.severity} />
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${impactColors[item.businessImpact]}`}>
                    {item.businessImpact} Business Impact
                  </span>
                </div>

                <p className="font-semibold text-white text-sm leading-relaxed mb-1">{item.issue}</p>
                <p className="text-xs text-slate-500 mb-4">{item.standard} — <span className="text-slate-400">{item.pageTitle}</span></p>

                {/* Metrics row */}
                <div className="flex flex-wrap gap-4">
                  <div className="flex items-center gap-2">
                    <Clock size={14} className="text-slate-500" />
                    <div>
                      <p className="text-[10px] text-slate-500">Fix Time</p>
                      <p className="text-xs font-semibold text-white">{item.fixTime}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <TrendingUp size={14} className="text-slate-500" />
                    <div>
                      <p className="text-[10px] text-slate-500">UX Gain</p>
                      <p className="text-xs font-semibold text-emerald-400">{item.uxGain}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <AlertTriangle size={14} className="text-slate-500" />
                    <div>
                      <p className="text-[10px] text-slate-500">A11y Gain</p>
                      <p className="text-xs font-semibold text-blue-400">{item.a11yGain}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Generate Fix CTA */}
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => {
                  const page = activeAudit.pages.find(p => p.url === item.pageUrl);
                  if (page) setSelectedPage(page);
                  generateFixForIssue(item.pageUrl, item.issueId);
                }}
                className="bg-gradient-button px-5 py-3 rounded-xl font-semibold text-white text-sm flex items-center gap-2 flex-shrink-0 self-start"
              >
                Generate Fix
                <ChevronRight size={16} />
              </motion.button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default TopImprovements;
