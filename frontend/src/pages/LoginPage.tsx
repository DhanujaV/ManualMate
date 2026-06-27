import React from 'react';
import { motion } from 'framer-motion';
import { 
  Shield, Eye, GitCompare, BarChart3, 
  Sun, Moon, ArrowLeft 
} from 'lucide-react';
import { useAudit } from '../context/AuditContext';
import BackgroundFX from '../components/auth/BackgroundFX';
import AuthCard from '../components/auth/AuthCard';
import LoginForm from '../components/auth/LoginForm';
import AINetworkVisual from '../components/auth/AINetworkVisual';

const LoginPage: React.FC = () => {
  const { theme, setTheme, setActiveTab } = useAudit();
  const isDark = theme === 'dark';

  const bullets = [
    { 
      icon: Eye, 
      title: 'AI-Powered UX Auditing', 
      desc: 'Gemini vision models evaluate layouts against industry design standards.' 
    },
    { 
      icon: Shield, 
      title: 'Accessibility Analysis (WCAG 2.2)', 
      desc: 'Automated scans for keyboard navigability, screen readers, and contrast ratios.' 
    },
    { 
      icon: BarChart3, 
      title: 'Smart Prioritization Engine', 
      desc: 'Focus on improvements with the highest conversion rate and business impact.' 
    },
    { 
      icon: GitCompare, 
      title: 'Before/After UI Transformation', 
      desc: 'Instantly view, inspect, and copy AI-generated Tailwind and HTML fixes.' 
    }
  ];

  return (
    <div className="relative min-h-screen flex flex-col justify-between overflow-x-hidden selection:bg-blue-500/30 selection:text-blue-200">
      {/* Background visual effects */}
      <BackgroundFX />

      {/* Header controls (Top bar) */}
      <header className="w-full max-w-7xl mx-auto px-6 py-5 flex items-center justify-between z-20">
        {/* Back to Home landing link */}
        <motion.button
          onClick={() => setActiveTab('landing')}
          whileHover={{ x: -2 }}
          whileTap={{ scale: 0.98 }}
          className="flex items-center gap-2 text-sm font-medium text-slate-400 hover:text-slate-200 transition-colors focus:outline-none"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </motion.button>

        {/* Theme Toggle Button */}
        <motion.button
          onClick={() => setTheme(isDark ? 'light' : 'dark')}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="p-2.5 rounded-xl border border-white/[0.06] hover:bg-white/[0.04] transition-all focus:outline-none text-slate-400 hover:text-slate-200"
          style={{
            borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)',
            backgroundColor: isDark ? 'rgba(255, 255, 255, 0.02)' : 'rgba(0, 0, 0, 0.02)',
          }}
          title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
        >
          {isDark ? <Sun className="w-4.5 h-4.5" /> : <Moon className="w-4.5 h-4.5" />}
        </motion.button>
      </header>

      {/* Main Split Layout Container */}
      <main className="w-full max-w-7xl mx-auto px-6 flex-1 flex items-center justify-center py-6 z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center w-full">
          
          {/* LEFT SIDE: Brand Panel (Desktop only, hidden on mobile) */}
          <section className="hidden lg:flex lg:col-span-6 xl:col-span-7 flex-col justify-center space-y-8 pr-8">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="space-y-6"
            >
              {/* Logo */}
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center shadow-xl shadow-blue-500/20">
                  <BarChart3 className="w-6 h-6 text-white" />
                </div>
                <div className="flex flex-col">
                  <span className="text-2xl font-black tracking-tight text-white leading-none">UXVerse <span className="text-blue-400">AI</span></span>
                  <span className="text-xs text-slate-400 tracking-wider font-semibold mt-0.5">ENTERPRISE AUDIT SUITE</span>
                </div>
              </div>

              {/* Tagline */}
              <h1 className="text-3xl xl:text-4xl font-extrabold leading-tight text-white tracking-tight">
                Autonomous AI UX Auditor for{' '}
                <span className="text-gradient-brand">Modern Web Applications</span>
              </h1>
            </motion.div>

            {/* AI Network Interactive Visual */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.15 }}
              className="flex justify-center"
            >
              <AINetworkVisual />
            </motion.div>

            {/* Bullet points of platform features */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-2">
              {bullets.map((bullet, idx) => {
                const Icon = bullet.icon;
                return (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 + idx * 0.1 }}
                    className="flex gap-3 p-3 rounded-2xl border border-white/[0.03] bg-white/[0.01]"
                  >
                    <div className="w-9 h-9 rounded-xl bg-blue-600/10 flex items-center justify-center flex-shrink-0">
                      <Icon className="w-4.5 h-4.5 text-blue-400" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-slate-200">{bullet.title}</h3>
                      <p className="text-xs text-slate-400 mt-1 leading-relaxed">{bullet.desc}</p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </section>

          {/* RIGHT SIDE: Login Panel */}
          <section className="col-span-1 lg:col-span-6 xl:col-span-5 flex justify-center lg:justify-end w-full">
            <div className="w-full max-w-[480px]">
              
              {/* Mobile-only logo display (hidden on desktop) */}
              <div className="flex items-center justify-center gap-3.5 mb-8 lg:hidden">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center">
                  <BarChart3 className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-extrabold text-white tracking-tight">UXVerse AI</span>
              </div>

              <AuthCard>
                <div className="text-center lg:text-left mb-8">
                  <motion.h2 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                    className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight"
                  >
                    Welcome back
                  </motion.h2>
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-sm text-slate-400 mt-2"
                  >
                    Sign in to your UXVerse AI dashboard
                  </motion.p>
                </div>

                <LoginForm />
              </AuthCard>
            </div>
          </section>
        </div>
      </main>

      {/* Footer copyright */}
      <footer className="w-full text-center py-6 text-xs text-slate-500 z-10">
        © 2026 UXVerse AI. All rights reserved. Powered by Gemini.
      </footer>
    </div>
  );
};

export default LoginPage;
