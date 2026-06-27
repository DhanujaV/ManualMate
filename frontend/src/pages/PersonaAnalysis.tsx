import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Users, Smile, Meh, Frown } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { useAudit } from '../context/AuditContext';
import ScoreRing from '../components/ScoreRing';

const personaEmojis: Record<string, string> = {
  'First-time Visitor':   '🧭',
  'Elderly User':         '👴',
  'Power User':           '⚡',
  'Visually Impaired User': '♿',
  'Frequent Customer':    '🏆',
};

const personaColors = [
  'from-blue-500 to-cyan-500',
  'from-violet-500 to-purple-500',
  'from-amber-500 to-orange-500',
  'from-emerald-500 to-teal-500',
  'from-rose-500 to-pink-500',
];

const PersonaAnalysis: React.FC = () => {
  const { activeAudit, selectedPage } = useAudit();
  const [selectedIndex, setSelectedIndex] = useState(0);

  const personas = selectedPage?.personas?.length
    ? selectedPage.personas
    : activeAudit?.pages[0]?.personas ?? [];

  if (!activeAudit || personas.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <Users size={48} className="text-slate-600 mx-auto mb-4" />
          <p className="text-slate-400">Run an audit to view persona analysis results.</p>
        </div>
      </div>
    );
  }

  const persona = personas[selectedIndex];
  const chartData = personas.map((p) => ({ name: p.name.split(' ')[0], score: p.score }));
  const SatIcon = persona.satisfaction === 'High' ? Smile : persona.satisfaction === 'Medium' ? Meh : Frown;
  const satColor = persona.satisfaction === 'High' ? 'text-emerald-400' : persona.satisfaction === 'Medium' ? 'text-amber-400' : 'text-red-400';
  const tooltipStyle = { background: 'rgba(15,23,42,0.95)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', color: '#e2e8f0', fontSize: '12px' };

  return (
    <div className="p-6 md:p-8 space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-white">Persona Analysis</h1>
        <p className="text-slate-400 text-sm mt-1">How different user types experience your website.</p>
      </motion.div>

      {/* Persona selector */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
        {personas.map((p, i) => (
          <motion.button key={p.name}
            initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.08 }}
            onClick={() => setSelectedIndex(i)}
            className={`p-4 rounded-2xl text-center transition-all duration-200 ${selectedIndex === i ? 'ring-2 ring-blue-500/40' : 'glass-card glass-card-hover'}`}
            style={selectedIndex === i ? { background: 'rgba(59,130,246,0.12)', border: '1px solid rgba(59,130,246,0.25)' } : {}}
          >
            <div className="text-3xl mb-2">{personaEmojis[p.name] ?? '👤'}</div>
            <p className="text-xs font-semibold text-white">{p.name}</p>
            <p className="text-xs text-slate-500 mt-0.5">{p.role}</p>
            <div className={`mt-2 text-lg font-bold ${p.score >= 80 ? 'text-emerald-400' : p.score >= 60 ? 'text-amber-400' : 'text-red-400'}`}>{p.score}</div>
          </motion.button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Detail card */}
        <motion.div key={persona.name} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          className="glass-card p-6 rounded-2xl space-y-5 lg:col-span-1">
          <div className="flex items-center gap-4">
            <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${personaColors[selectedIndex]} flex items-center justify-center text-2xl`}>
              {personaEmojis[persona.name] ?? '👤'}
            </div>
            <div>
              <h2 className="font-bold text-white">{persona.name}</h2>
              <p className="text-xs text-slate-400">{persona.role}</p>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.04)' }}>
            <div>
              <p className="text-xs text-slate-400">Satisfaction</p>
              <p className={`font-bold text-lg ${satColor}`}>{persona.satisfaction}</p>
            </div>
            <SatIcon size={28} className={satColor} />
          </div>

          <div className="flex justify-center"><ScoreRing score={persona.score} size={80} /></div>

          <div className="p-4 rounded-xl" style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.12)' }}>
            <p className="text-[10px] text-red-400 font-semibold mb-1.5">PAIN POINT</p>
            <p className="text-xs text-slate-300">{persona.friction}</p>
          </div>

          <div className="p-4 rounded-xl" style={{ background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.12)' }}>
            <p className="text-[10px] text-emerald-400 font-semibold mb-1.5">RECOMMENDATION</p>
            <p className="text-xs text-slate-300">{persona.recommendation}</p>
          </div>
        </motion.div>

        {/* Chart */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="glass-card p-6 rounded-2xl lg:col-span-2">
          <h2 className="text-sm font-semibold text-slate-300 mb-4">All Persona Satisfaction Scores</h2>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={chartData} barSize={36}>
              <defs>
                <linearGradient id="persona-bar-gradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#8b5cf6" />
                  <stop offset="100%" stopColor="#3b82f6" />
                </linearGradient>
              </defs>
              <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis domain={[0, 100]} tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="score" name="Score" radius={[8, 8, 0, 0]} fill="url(#persona-bar-gradient)" />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>
    </div>
  );
};

export default PersonaAnalysis;
