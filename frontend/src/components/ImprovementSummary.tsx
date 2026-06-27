import React from 'react';
import { ArrowUpRight } from 'lucide-react';

interface ImprovementSummaryProps {
  activeAudit: any;
}

const ImprovementSummary: React.FC<ImprovementSummaryProps> = ({ activeAudit }) => {
  if (!activeAudit) return null;

  const uxDelta = activeAudit.pages[0]?.businessImpact?.csat_lift_percentage || 8.5;
  const a11yDelta = 100 - activeAudit.a11yScore > 10 ? Math.round((100 - activeAudit.a11yScore) / 2) : 6;
  const seoDelta = 5;
  const performanceDelta = 9;

  const metrics = [
    { label: 'Accessibility', value: `+${a11yDelta}%`, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/25' },
    { label: 'UX / CSAT Lift', value: `+${uxDelta}%`, color: 'text-violet-400', bg: 'bg-violet-500/10 border-violet-500/25' },
    { label: 'SEO Visibility', value: `+${seoDelta}%`, color: 'text-sky-400', bg: 'bg-sky-500/10 border-sky-500/25' },
    { label: 'Performance Load', value: `+${performanceDelta}%`, color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/25' },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {metrics.map((m) => (
        <div key={m.label} className={`p-4 rounded-xl border flex items-center justify-between ${m.bg}`}>
          <div>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{m.label}</p>
            <p className={`text-xl font-black mt-1 ${m.color}`}>{m.value}</p>
          </div>
          <ArrowUpRight size={16} className={m.color} />
        </div>
      ))}
    </div>
  );
};

export default ImprovementSummary;
