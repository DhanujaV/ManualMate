import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Globe, BarChart3, FileSearch, GitCompare,
  Users, TrendingUp, Zap, MessageSquare, ChevronLeft, ChevronRight,
  Sun, Moon, Scan, History, Sparkles
} from 'lucide-react';
import { useAudit } from '../context/AuditContext';
import type { TabName } from '../context/AuditContext';

const navItems: { id: TabName; icon: React.ElementType; label: string; requiresAudit?: boolean }[] = [
  { id: 'landing', icon: Sparkles, label: 'UXVerse AI' },
  { id: 'auditor', icon: Scan, label: 'Start Audit' },
  { id: 'overall', icon: LayoutDashboard, label: 'Dashboard', requiresAudit: true },
  { id: 'structure', icon: Globe, label: 'Site Structure', requiresAudit: true },
  { id: 'details', icon: FileSearch, label: 'Page Details', requiresAudit: true },
  { id: 'beforeafter', icon: GitCompare, label: 'Before vs After', requiresAudit: true },
  { id: 'personas', icon: Users, label: 'Persona Analysis', requiresAudit: true },
  { id: 'business', icon: TrendingUp, label: 'Business Impact', requiresAudit: true },
  { id: 'topfixes', icon: Zap, label: 'Top Improvements', requiresAudit: true },
  { id: 'coach', icon: MessageSquare, label: 'AI UX Coach' },
  { id: 'progress', icon: History, label: 'Progress Tracker' },
];

const Sidebar: React.FC = () => {
  const { activeTab, setActiveTab, theme, setTheme, activeAudit, auditUrl } = useAudit();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <motion.aside
      initial={{ width: 240 }}
      animate={{ width: collapsed ? 72 : 240 }}
      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
      className="relative flex flex-col h-screen z-50 flex-shrink-0 overflow-hidden"
      style={{
        background: 'rgba(7, 10, 25, 0.85)',
        backdropFilter: 'blur(20px)',
        borderRight: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-white/[0.06]">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-blue-500/20">
          <BarChart3 size={18} className="text-white" />
        </div>
        <AnimatePresence>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col"
            >
              <span className="text-sm font-bold text-white leading-none">UXVerse AI</span>
              <span className="text-[10px] text-slate-400 mt-0.5">UX Audit Platform</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Active audit badge */}
      <AnimatePresence>
        {!collapsed && activeAudit && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mx-3 mt-3 p-3 rounded-xl overflow-hidden"
            style={{ background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.15)' }}
          >
            <p className="text-[10px] text-blue-400 font-medium mb-1">ACTIVE AUDIT</p>
            <p className="text-xs text-white truncate">{auditUrl}</p>
            <div className="flex gap-3 mt-2">
              <div className="flex flex-col">
                <span className="text-[10px] text-slate-400">UX</span>
                <span className="text-sm font-bold text-blue-400">{activeAudit.uxScore}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] text-slate-400">A11y</span>
                <span className="text-sm font-bold text-emerald-400">{activeAudit.a11yScore}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] text-slate-400">Issues</span>
                <span className="text-sm font-bold text-rose-400">{activeAudit.criticalCount}</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navigation */}
      <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          const isDisabled = item.requiresAudit && !activeAudit;
          const Icon = item.icon;

          return (
            <motion.button
              key={item.id}
              onClick={() => !isDisabled && setActiveTab(item.id)}
              whileHover={!isDisabled ? { x: 2 } : {}}
              whileTap={!isDisabled ? { scale: 0.98 } : {}}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all duration-200 ${
                isActive
                  ? 'bg-blue-600/20 text-blue-300'
                  : isDisabled
                  ? 'text-slate-600 cursor-not-allowed'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
              }`}
            >
              <Icon size={16} className="flex-shrink-0" />
              <AnimatePresence>
                {!collapsed && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-sm font-medium whitespace-nowrap"
                  >
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>
              {isActive && (
                <motion.div
                  layoutId="active-indicator"
                  className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-400 flex-shrink-0"
                />
              )}
            </motion.button>
          );
        })}
      </nav>

      {/* Bottom controls */}
      <div className="p-3 border-t border-white/[0.06] flex flex-col gap-2">
        <button
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-white/[0.04] transition-all duration-200`}
        >
          {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
          <AnimatePresence>
            {!collapsed && (
              <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-sm">
                {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full flex items-center justify-center z-10"
        style={{ background: 'rgba(15,23,42,0.9)', border: '1px solid rgba(255,255,255,0.1)' }}
      >
        {collapsed ? <ChevronRight size={12} className="text-slate-400" /> : <ChevronLeft size={12} className="text-slate-400" />}
      </button>
    </motion.aside>
  );
};

export default Sidebar;
