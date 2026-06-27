import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Zap, Shield, Globe, GitCompare, BarChart3, ArrowLeft } from 'lucide-react';
import { useAudit } from '../context/AuditContext';
import { useAuth } from './useAuth';
import { loginWithGoogle } from './authService';
import BackgroundFX from '../components/BackgroundFX';
import AuthCard from '../components/AuthCard';

// Animated SVG Network visualization for Branding Panel
const BrandingNetwork: React.FC = () => {
  const nodes = [
    { x: 120, y: 100, size: 8, delay: 0 },
    { x: 260, y: 70, size: 6, delay: 0.4 },
    { x: 400, y: 130, size: 10, delay: 0.8 },
    { x: 180, y: 220, size: 7, delay: 1.2 },
    { x: 360, y: 300, size: 9, delay: 1.6 },
    { x: 100, y: 330, size: 5, delay: 2.0 },
  ];

  return (
    <div className="relative w-full h-[360px] flex items-center justify-center">
      <svg className="w-full h-full max-w-[460px] z-10" viewBox="0 0 500 400" fill="none" xmlns="http://www.w3.org/2000/svg">
        <motion.path
          d="M 120 100 L 260 70 M 260 70 L 400 130 M 120 100 L 180 220 M 260 70 L 180 220 M 400 130 L 360 300 M 180 220 L 360 300 M 180 220 L 100 330 M 360 300 L 100 330"
          stroke="url(#pulse-grad)"
          strokeWidth="1.5"
          strokeDasharray="6 4"
          animate={{ strokeDashoffset: [0, -40] }}
          transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
        />
        <defs>
          <linearGradient id="pulse-grad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.4" />
            <stop offset="50%" stopColor="#8b5cf6" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#10b981" stopOpacity="0.4" />
          </linearGradient>
          <radialGradient id="dot-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0" />
          </radialGradient>
        </defs>

        {nodes.map((node, i) => (
          <g key={i}>
            <circle cx={node.x} cy={node.y} r={node.size + 8} fill="url(#dot-glow)" opacity="0.3" />
            <motion.circle
              cx={node.x}
              cy={node.y}
              r={node.size}
              fill={i % 3 === 0 ? "#3b82f6" : i % 3 === 1 ? "#8b5cf6" : "#10b981"}
              animate={{ scale: [1, 1.2, 1], opacity: [0.8, 1, 0.8] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: node.delay }}
            />
          </g>
        ))}
      </svg>
    </div>
  );
};

export const LoginPage: React.FC = () => {
  const { setActiveTab } = useAudit();
  const { user, loading: authStateLoading } = useAuth();
  const [authInProgress, setAuthInProgress] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Auto redirect if already logged in
  useEffect(() => {
    if (!authStateLoading && user) {
      setActiveTab('auditor');
    }
  }, [user, authStateLoading, setActiveTab]);

  const handleGoogleLogin = async () => {
    try {
      setErrorMsg(null);
      setAuthInProgress(true);
      
      await loginWithGoogle();
      
      // Redirect to auditor dashboard workspace
      setActiveTab('auditor');
    } catch (err: any) {
      console.error("Google Authentication error:", err);
      // Catch pop-up closures and network issues
      if (err.code === "auth/popup-closed-by-user") {
        setErrorMsg("Sign-in popup closed before completion. Please try again.");
      } else if (err.code === "auth/network-request-failed") {
        setErrorMsg("Network error occurred. Please check your internet connection.");
      } else {
        setErrorMsg(err.message || "Failed to authenticate with Google. Please try again.");
      }
    } finally {
      setAuthInProgress(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full flex flex-col justify-between overflow-hidden bg-slate-950 text-slate-100 font-sans select-none">
      {/* Background orbs FX */}
      <BackgroundFX />

      {/* Top Navigation Navbar */}
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
          Back to website
        </button>
      </header>

      {/* Split layout: Branding vs Auth Panel */}
      <main className="relative z-10 flex-1 grid grid-cols-1 lg:grid-cols-12 max-w-7xl w-full mx-auto px-6 py-6 lg:py-12 items-center gap-8 lg:gap-12">
        {/* Left Side: Branding Panel */}
        <div className="hidden lg:flex lg:col-span-6 flex-col justify-center space-y-8 pr-8">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-4"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-xs font-bold text-blue-300">
              <Zap size={10} className="text-blue-400" />
              Intelligence Validation
            </div>
            <h1 className="text-4xl md:text-5xl font-black leading-tight text-white tracking-tight">
              AI-powered UX auditing <br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-violet-500">intelligence platform</span>
            </h1>
            <p className="text-base text-slate-400 leading-relaxed font-medium">
              Analyze interfaces dynamically. Verify layouts, test screen readers, and inspect accessibility rules autonomously using specialized AI models.
            </p>
          </motion.div>

          {/* Grid bullets */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
            className="grid grid-cols-2 gap-4"
          >
            {[
              { icon: Globe, title: "AI UX Analysis", desc: "Checks heuristics on the fly" },
              { icon: Shield, title: "Accessibility Compliance", desc: "Validates WCAG 2.2 metrics" },
              { icon: Zap, title: "Smart Prioritization", desc: "Highlights issues with max ROI" },
              { icon: GitCompare, title: "Before/After Code Fixes", desc: "Instant HTML/CSS code updates" }
            ].map((feat, i) => (
              <div key={i} className="flex gap-3">
                <div className="w-9 h-9 rounded-lg bg-white/[0.03] border border-white/[0.05] flex items-center justify-center text-slate-300 flex-shrink-0">
                  <feat.icon size={16} />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">{feat.title}</h4>
                  <p className="text-[10px] text-slate-400 font-semibold mt-0.5">{feat.desc}</p>
                </div>
              </div>
            ))}
          </motion.div>

          {/* Abstract Pulse Network */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
          >
            <BrandingNetwork />
          </motion.div>
        </div>

        {/* Right Side: Auth Card Panel */}
        <div className="lg:col-span-6 flex items-center justify-center w-full">
          <AuthCard 
            onGoogleLogin={handleGoogleLogin} 
            isLoading={authInProgress || authStateLoading} 
            errorMsg={errorMsg}
          />
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 w-full px-6 py-6 text-center text-[10px] text-slate-500 border-t border-white/[0.03]">
        <p>© 2026 UXVerse AI. All rights reserved. Powered by Google Firebase Authentication.</p>
      </footer>
    </div>
  );
};

export default LoginPage;
