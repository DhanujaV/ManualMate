import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, DollarSign, Heart, MousePointerClick } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { useAudit } from '../context/AuditContext';

const effortColors: Record<string, string> = {
  High:   'text-red-400 bg-red-500/10 border-red-500/20',
  Medium: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
  Low:    'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
};

const BusinessImpact: React.FC = () => {
  const { activeAudit } = useAudit();
  const pages = activeAudit?.pages ?? [];

  if (!activeAudit) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <TrendingUp size={48} className="text-slate-600 mx-auto mb-4" />
          <p className="text-slate-400">Run an audit to view business impact analysis.</p>
        </div>
      </div>
    );
  }

  const topPage = pages.reduce((best, p) =>
    p.businessImpact.estimated_monthly_revenue_lift > best.businessImpact.estimated_monthly_revenue_lift ? p : best, pages[0]);
  const totalRevenue   = pages.reduce((s, p) => s + p.businessImpact.estimated_monthly_revenue_lift, 0);
  const avgConversion  = pages.reduce((s, p) => s + p.businessImpact.conversion_lift_percentage, 0) / Math.max(1, pages.length);
  const avgCsat        = pages.reduce((s, p) => s + p.businessImpact.csat_lift_percentage, 0) / Math.max(1, pages.length);

  const chartData = pages.map((p) => ({
    name:     p.path === '/' ? 'Home' : p.path.replace('/', '').slice(0, 8),
    revenue:  p.businessImpact.estimated_monthly_revenue_lift,
  }));

  const tooltipStyle = { background: 'rgba(15,23,42,0.95)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', color: '#e2e8f0', fontSize: '12px' };

  const summaryCards = [
    { label: 'Est. Monthly Revenue Lift', value: `$${totalRevenue.toLocaleString()}`,     icon: DollarSign,        color: 'from-emerald-500 to-teal-600',   sub: 'across all pages' },
    { label: 'Avg Conversion Lift',       value: `+${avgConversion.toFixed(1)}%`,          icon: MousePointerClick, color: 'from-blue-500 to-indigo-600',    sub: 'with recommended fixes' },
    { label: 'CSAT Improvement',          value: `+${avgCsat.toFixed(1)}%`,                icon: Heart,             color: 'from-rose-500 to-pink-600',      sub: 'projected satisfaction gain' },
    { label: 'Highest Impact Page',       value: topPage?.path ?? '/',                     icon: TrendingUp,        color: 'from-violet-500 to-purple-600',  sub: `$${topPage?.businessImpact.estimated_monthly_revenue_lift.toLocaleString()} lift` },
  ];

  return (
    <div className="p-6 md:p-8 space-y-8">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-white">Business Impact Analysis</h1>
        <p className="text-slate-400 text-sm mt-1">Projected revenue and satisfaction gains from resolving detected UX and accessibility issues.</p>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {summaryCards.map((card, i) => (
          <motion.div key={card.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
            className="glass-card p-6 rounded-2xl">
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center mb-4`}>
              <card.icon size={18} className="text-white" />
            </div>
            <p className="text-2xl font-bold text-white truncate">{card.value}</p>
            <p className="text-xs text-slate-400 mt-1">{card.label}</p>
            <p className="text-[10px] text-slate-600 mt-0.5">{card.sub}</p>
          </motion.div>
        ))}
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass-card p-6 rounded-2xl">
        <h2 className="text-sm font-semibold text-slate-300 mb-4">Revenue Lift by Page ($/month)</h2>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={chartData}>
            <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={tooltipStyle} formatter={(v) => [`$${v}`, 'Revenue Lift']} />
            <Bar dataKey="revenue" radius={[6, 6, 0, 0]}>
              {chartData.map((_, idx) => <Cell key={idx} fill={idx % 2 === 0 ? '#10b981' : '#3b82f6'} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="glass-card rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-white/[0.06]">
          <h2 className="text-sm font-semibold text-white">Page-Level Impact Breakdown</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/[0.04]">
                {['Page', 'Revenue Lift', 'Conversion Lift', 'CSAT Lift', 'Dev Effort'].map((h) => (
                  <th key={h} className="px-6 py-3 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.03]">
              {pages.map((page) => (
                <tr key={page.path} className="hover:bg-white/[0.015] transition-colors">
                  <td className="px-6 py-3">
                    <p className="font-medium text-white text-xs">{page.title}</p>
                    <p className="text-[10px] font-mono text-slate-500">{page.path}</p>
                  </td>
                  <td className="px-6 py-3 font-semibold text-emerald-400 text-xs">${page.businessImpact.estimated_monthly_revenue_lift.toLocaleString()}</td>
                  <td className="px-6 py-3 font-semibold text-blue-400 text-xs">+{page.businessImpact.conversion_lift_percentage}%</td>
                  <td className="px-6 py-3 font-semibold text-rose-400 text-xs">+{page.businessImpact.csat_lift_percentage}%</td>
                  <td className="px-6 py-3">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-semibold border ${effortColors[page.businessImpact.development_effort]}`}>
                      {page.businessImpact.development_effort}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
};

export default BusinessImpact;
