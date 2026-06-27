<<<<<<< HEAD
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
=======
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Zap, Shield, Globe, GitCompare, Eye, EyeOff, 
  ArrowLeft, Lock, Mail, BarChart3
} from 'lucide-react';
import { useAudit } from '../context/AuditContext';

// Background FX component with moving gradient orbs
const BackgroundFX: React.FC = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {/* Background radial overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(6,8,20,0.8)_80%)] dark:bg-[radial-gradient(circle_at_center,transparent_0%,#060814_85%)]" />
      
      {/* Floating Orb 1 */}
      <motion.div
        animate={{
          x: [0, 100, -50, 0],
          y: [0, -80, 120, 0],
          scale: [1, 1.2, 0.9, 1],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="absolute top-1/4 left-1/4 w-[450px] h-[450px] rounded-full bg-blue-500/10 dark:bg-blue-600/10 blur-[100px]"
      />
      
      {/* Floating Orb 2 */}
      <motion.div
        animate={{
          x: [0, -120, 80, 0],
          y: [0, 100, -70, 0],
          scale: [1, 0.8, 1.1, 1],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 2
        }}
        className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] rounded-full bg-purple-500/10 dark:bg-violet-600/10 blur-[120px]"
      />

      {/* Floating Orb 3 */}
      <motion.div
        animate={{
          x: [0, 70, -90, 0],
          y: [0, 90, -110, 0],
          scale: [1, 1.15, 0.85, 1],
        }}
        transition={{
          duration: 22,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 4
        }}
        className="absolute top-1/2 left-2/3 w-[350px] h-[350px] rounded-full bg-emerald-500/5 dark:bg-emerald-600/5 blur-[90px]"
      />

      {/* Subtle grid pattern overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:40px_40px] dark:bg-[linear-gradient(rgba(255,255,255,0.007)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.007)_1px,transparent_1px)]" />
    </div>
  );
};

// Interactive Node Network visualization for Brand Panel
const AbstractNetwork: React.FC = () => {
  const nodes = [
    { x: 100, y: 120, size: 8, delay: 0 },
    { x: 280, y: 80, size: 6, delay: 0.5 },
    { x: 420, y: 150, size: 10, delay: 1.0 },
    { x: 200, y: 240, size: 7, delay: 1.5 },
    { x: 380, y: 320, size: 9, delay: 2.0 },
    { x: 120, y: 350, size: 5, delay: 2.5 },
  ];

  return (
    <div className="relative w-full h-[400px] flex items-center justify-center">
      <svg className="w-full h-full max-w-[500px] z-10" viewBox="0 0 500 400" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Connection lines */}
        <motion.path
          d="M 100 120 L 280 80 M 280 80 L 420 150 M 100 120 L 200 240 M 280 80 L 200 240 M 420 150 L 380 320 M 200 240 L 380 320 M 200 240 L 120 350 M 380 320 L 120 350"
          stroke="url(#line-grad)"
          strokeWidth="1.5"
          strokeDasharray="6 4"
          animate={{ strokeDashoffset: [0, -40] }}
          transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
        />

        {/* Highlight paths */}
        <path d="M 100 120 L 280 80 L 420 150 L 380 320 L 200 240 Z" stroke="rgba(139, 92, 246, 0.2)" strokeWidth="1" />

        {/* Gradients */}
        <defs>
          <linearGradient id="line-grad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.4" />
            <stop offset="50%" stopColor="#8b5cf6" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#10b981" stopOpacity="0.4" />
          </linearGradient>
          <radialGradient id="node-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Animated pulse rings */}
        <motion.circle
          cx="200" cy="240" r="35"
          stroke="rgba(59, 130, 246, 0.3)"
          strokeWidth="1.5"
          animate={{ scale: [1, 1.8], opacity: [0.6, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeOut" }}
        />
        <motion.circle
          cx="380" cy="320" r="45"
          stroke="rgba(139, 92, 246, 0.3)"
          strokeWidth="1.5"
          animate={{ scale: [1, 1.6], opacity: [0.5, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeOut", delay: 1 }}
        />

        {/* Node dots */}
        {nodes.map((node, i) => (
          <g key={i}>
            <circle cx={node.x} cy={node.y} r={node.size + 8} fill="url(#node-glow)" opacity="0.3" />
            <motion.circle
              cx={node.x}
              cy={node.y}
              r={node.size}
              fill={i % 3 === 0 ? "#3b82f6" : i % 3 === 1 ? "#8b5cf6" : "#10b981"}
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.8, 1, 0.8],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut",
                delay: node.delay
              }}
            />
          </g>
        ))}
      </svg>
      
      {/* Floating brand stats */}
      <motion.div
        animate={{ y: [-6, 6, -6] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-12 right-6 glass-card p-3 rounded-xl border border-white/10 shadow-lg flex items-center gap-3 backdrop-blur-md"
      >
        <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
          <Shield size={16} />
        </div>
        <div>
          <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">A11y Check</p>
          <p className="text-xs font-bold text-white">WCAG 2.2 Compliant</p>
        </div>
      </motion.div>

      <motion.div
        animate={{ y: [6, -6, 6] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        className="absolute bottom-16 left-6 glass-card p-3 rounded-xl border border-white/10 shadow-lg flex items-center gap-3 backdrop-blur-md"
      >
        <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400">
          <Zap size={16} />
        </div>
        <div>
          <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Vision Engine</p>
          <p className="text-xs font-bold text-white">Heuristics Audit Live</p>
        </div>
      </motion.div>
    </div>
  );
};

// Modular LoginForm Component
const LoginForm: React.FC<{ onSubmit: (e: React.FormEvent) => void; isError: boolean; isLoading: boolean }> = ({ onSubmit, isError, isLoading }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(e); }} className="space-y-5">
      {isError && (
        <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-xs font-bold text-red-400">
          Invalid credentials. Password must be at least 6 characters.
        </div>
      )}

      {/* Email Field */}
      <div className="relative">
        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" size={18} />
        <input
          type="email"
          id="email-input"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          placeholder=" "
          className="peer w-full pl-11 pr-4 py-3.5 rounded-xl border border-slate-200 dark:border-white/[0.08] bg-slate-50/50 dark:bg-white/[0.03] text-slate-900 dark:text-white placeholder-transparent focus:border-blue-500/60 dark:focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all duration-200 text-sm font-medium"
        />
        <label
          htmlFor="email-input"
          className="absolute left-11 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400 dark:text-slate-500 pointer-events-none transition-all duration-200 
          peer-placeholder-shown:text-sm peer-placeholder-shown:font-medium peer-placeholder-shown:top-1/2 
          peer-focus:-translate-y-6 peer-focus:text-[10px] peer-focus:font-bold peer-focus:text-blue-500 dark:peer-focus:text-blue-400
          peer-[:not(:placeholder-shown)]:-translate-y-6 peer-[:not(:placeholder-shown)]:text-[10px] peer-[:not(:placeholder-shown)]:font-bold"
        >
          Email Address
        </label>
      </div>

      {/* Password Field */}
      <div className="relative">
        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" size={18} />
        <input
          type={showPassword ? "text" : "password"}
          id="password-input"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          placeholder=" "
          className="peer w-full pl-11 pr-12 py-3.5 rounded-xl border border-slate-200 dark:border-white/[0.08] bg-slate-50/50 dark:bg-white/[0.03] text-slate-900 dark:text-white placeholder-transparent focus:border-blue-500/60 dark:focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all duration-200 text-sm font-medium"
        />
        <label
          htmlFor="password-input"
          className="absolute left-11 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400 dark:text-slate-500 pointer-events-none transition-all duration-200 
          peer-placeholder-shown:text-sm peer-placeholder-shown:font-medium peer-placeholder-shown:top-1/2 
          peer-focus:-translate-y-6 peer-focus:text-[10px] peer-focus:font-bold peer-focus:text-blue-500 dark:peer-focus:text-blue-400
          peer-[:not(:placeholder-shown)]:-translate-y-6 peer-[:not(:placeholder-shown)]:text-[10px] peer-[:not(:placeholder-shown)]:font-bold"
        >
          Password
        </label>
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
        >
          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>

      {/* Options Row */}
      <div className="flex items-center justify-between text-xs mt-1">
        <label className="flex items-center gap-2 text-slate-500 dark:text-slate-400 font-semibold cursor-pointer select-none">
          <input
            type="checkbox"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            className="w-4 h-4 rounded border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/[0.03] text-blue-600 focus:ring-blue-500/20 focus:ring-offset-0 transition-colors cursor-pointer"
          />
          Remember me
        </label>
        <a
          href="#"
          onClick={(e) => e.preventDefault()}
          className="font-semibold text-blue-600 dark:text-blue-400 hover:underline"
        >
          Forgot password?
        </a>
      </div>

      {/* Submit Button */}
      <motion.button
        type="submit"
        disabled={isLoading}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        className="relative w-full py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 text-white font-bold text-sm shadow-lg shadow-blue-500/20 hover:shadow-xl hover:shadow-blue-500/35 active:shadow-md transition-all duration-200 flex items-center justify-center overflow-hidden"
      >
        {isLoading ? (
          <div className="flex items-center gap-2">
            <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <span>Signing In...</span>
          </div>
        ) : (
          <span>Sign In</span>
        )}
      </motion.button>
    </form>
  );
};

// Modular AuthCard component
const AuthCard: React.FC = () => {
  const { setActiveTab } = useAudit();
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsError(false);
    
    // Basic rich validation
    const pwdInput = document.getElementById('password-input') as HTMLInputElement;
    if (pwdInput && pwdInput.value.length < 6) {
      // Trigger card shake animation
      setIsError(true);
      return;
    }

    setIsLoading(true);
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1400));
    
    // Auto redirect to auditor dashboard after mock login
    setIsLoading(false);
    setActiveTab('auditor');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={isError ? { x: [-10, 10, -10, 10, 0] } : { opacity: 1, y: 0 }}
      transition={isError ? { duration: 0.4 } : { duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="relative z-10 w-full max-w-[460px] mx-auto"
    >
      {/* Outer card shell with high-performance glassmorphism */}
      <div 
        className="w-full glass-card p-8 md:p-10 rounded-3xl border border-slate-200/50 dark:border-white/[0.06] shadow-[0_20px_50px_rgba(0,0,0,0.15)] backdrop-blur-2xl bg-white/60 dark:bg-slate-950/45"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Welcome back
          </h2>
          <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 mt-2">
            Sign in to your UXVerse AI dashboard
          </p>
        </div>

        {/* OAuth Buttons */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {}}
            className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl border border-slate-200 dark:border-white/[0.08] bg-slate-50/50 dark:bg-white/[0.02] hover:bg-slate-100/60 dark:hover:bg-white/[0.05] text-xs font-bold text-slate-700 dark:text-slate-300 transition-all duration-200"
          >
            {/* Google custom SVG */}
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
            </svg>
            Google
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {}}
            className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl border border-slate-200 dark:border-white/[0.08] bg-slate-50/50 dark:bg-white/[0.02] hover:bg-slate-100/60 dark:hover:bg-white/[0.05] text-xs font-bold text-slate-700 dark:text-slate-300 transition-all duration-200"
          >
            {/* GitHub custom SVG */}
            <svg className="w-4 h-4 text-slate-900 dark:text-white" viewBox="0 0 24 24" fill="currentColor">
              <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.579.688.481C19.137 20.162 22 16.418 22 12c0-5.523-4.477-10-10-10z"/>
            </svg>
            GitHub
          </motion.button>
        </div>

        {/* Divider */}
        <div className="relative flex py-2 items-center mb-6">
          <div className="flex-grow border-t border-slate-200 dark:border-white/[0.06]"></div>
          <span className="flex-shrink mx-4 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
            OR
          </span>
          <div className="flex-grow border-t border-slate-200 dark:border-white/[0.06]"></div>
        </div>

        {/* Form */}
        <LoginForm onSubmit={handleLogin} isError={isError} isLoading={isLoading} />

        {/* Footer inside card */}
        <div className="mt-8 text-center space-y-4">
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            Don't have an account?{" "}
            <a 
              href="#" 
              onClick={(e) => { e.preventDefault(); setActiveTab('auditor'); }}
              className="text-blue-600 dark:text-blue-400 hover:underline font-bold"
            >
              Sign up
            </a>
          </p>
          <p className="text-[10px] text-slate-400 dark:text-slate-500 leading-relaxed max-w-[300px] mx-auto">
            By continuing, you agree to our{" "}
            <a href="#" className="underline hover:text-slate-600 dark:hover:text-slate-300">Terms of Service</a>{" "}
            and{" "}
            <a href="#" className="underline hover:text-slate-600 dark:hover:text-slate-300">Privacy Policy</a>.
          </p>
        </div>
      </div>
    </motion.div>
  );
};

// Main LoginPage Component
export const LoginPage: React.FC = () => {
  const { setActiveTab } = useAudit();

  return (
    <div className="relative min-h-screen w-full flex flex-col justify-between overflow-hidden bg-slate-950 text-slate-100 font-sans select-none">
      {/* Background Orbs & Grids */}
      <BackgroundFX />

      {/* Top Header navbar */}
      <header className="relative z-10 w-full px-6 py-5 flex items-center justify-between">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => setActiveTab('landing')}>
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center shadow-md">
            <BarChart3 size={16} className="text-white" />
          </div>
          <span className="font-extrabold text-white text-base tracking-tight">UXVerse AI</span>
        </div>
        
        <button
          onClick={() => setActiveTab('landing')}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/[0.08] hover:bg-white/[0.04] text-xs font-semibold text-slate-300 transition-all duration-200"
        >
          <ArrowLeft size={12} />
          Back to site
        </button>
      </header>

      {/* Split Hero / Form Area */}
      <main className="relative z-10 flex-1 grid grid-cols-1 lg:grid-cols-12 max-w-7xl w-full mx-auto px-6 py-6 lg:py-12 items-center gap-8 lg:gap-12">
        {/* Left Side: Brand Panel */}
        <div className="hidden lg:flex lg:col-span-6 flex-col justify-center space-y-8 pr-8">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-4"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-xs font-bold text-blue-300">
              <Zap size={10} className="text-blue-400" />
              Autonomous UX Auditor
            </div>
            <h1 className="text-4xl md:text-5xl font-black leading-tight text-white tracking-tight">
              Analyze UX & accessibility at <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-violet-500">AI speeds</span>
            </h1>
            <p className="text-base text-slate-400 leading-relaxed font-medium">
              Autonomous AI UX Auditor that crawls your sitemap, scores layouts via vision heuristic detection, and generates production-ready code fixes.
            </p>
          </motion.div>

          {/* Bullet Points */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
            className="grid grid-cols-2 gap-4"
          >
            {[
              { icon: Globe, title: "Autonomous Auditing", desc: "Crawls & maps accessibility" },
              { icon: Shield, title: "WCAG 2.2 Compliant", desc: "A/AA/AAA validation rules" },
              { icon: Zap, title: "AI Prioritization", desc: "Prioritizes high ROI issues" },
              { icon: GitCompare, title: "UI Transformations", desc: "Code generation matches" }
            ].map((feat, i) => (
              <div key={i} className="flex gap-3">
                <div className="w-9 h-9 rounded-lg bg-white/[0.04] border border-white/[0.06] flex items-center justify-center text-slate-300 flex-shrink-0">
                  <feat.icon size={16} />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">{feat.title}</h4>
                  <p className="text-[10px] text-slate-400 font-semibold mt-0.5">{feat.desc}</p>
                </div>
              </div>
            ))}
          </motion.div>

          {/* Abstract Network Graphic */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
          >
            <AbstractNetwork />
          </motion.div>
        </div>

        {/* Right Side: Login Panel */}
        <div className="lg:col-span-6 flex items-center justify-center">
          <AuthCard />
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 w-full px-6 py-6 text-center text-[10px] text-slate-500 border-t border-white/[0.03]">
        <p>© 2026 UXVerse AI. All rights reserved. Enterprise design validation pipeline.</p>
>>>>>>> 5bc2c5caeb8aa7b97340a9e14ea62c500517cdc8
      </footer>
    </div>
  );
};

export default LoginPage;
