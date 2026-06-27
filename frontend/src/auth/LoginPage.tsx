import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, ArrowLeft } from 'lucide-react';
import { useAudit } from '../context/AuditContext';
import { useAuth } from './useAuth';
import { loginWithGoogle } from './authService';
import BackgroundFX from '../components/BackgroundFX';
import AuthCard from '../components/AuthCard';

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
    <div className="relative min-h-screen w-full flex flex-col justify-between overflow-hidden bg-[#060814] text-slate-100 font-sans select-none">
      {/* Background Orbs & noise */}
      <BackgroundFX />

      {/* Top Navigation Navbar */}
      <header className="relative z-20 w-full px-6 py-5 flex items-center justify-between">
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

      {/* Fully Centered Content Container */}
      <main className="relative z-10 flex-grow flex items-center justify-center w-full px-6 py-8">
        <motion.div
          animate={{ y: [-4, 4, -4] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          className="w-full max-w-[420px]"
        >
          <AuthCard 
            onGoogleLogin={handleGoogleLogin} 
            isLoading={authInProgress || authStateLoading} 
            errorMsg={errorMsg}
          />
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="relative z-20 w-full px-6 py-6 text-center text-[10px] text-slate-500 border-t border-white/[0.03]">
        <p>© 2026 UXVerse AI. All rights reserved. Powered by Google Firebase Authentication.</p>
      </footer>
    </div>
  );
};

export default LoginPage;
