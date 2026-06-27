import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';
import GoogleButton from './GoogleButton';

interface AuthCardProps {
  onGoogleLogin: () => void;
  isLoading: boolean;
  errorMsg: string | null;
}

export const AuthCard: React.FC<AuthCardProps> = ({ onGoogleLogin, isLoading, errorMsg }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="relative z-10 w-full max-w-[460px] mx-auto px-4 sm:px-0"
    >
      {/* Glow highlight backing */}
      <div className="absolute -inset-1.5 rounded-3xl bg-gradient-to-r from-blue-500/10 to-violet-500/10 blur-xl opacity-75 pointer-events-none" />

      {/* Main card box with high-end glassmorphic style */}
      <div 
        className="w-full glass-card p-6 sm:p-10 rounded-3xl border border-slate-200/50 dark:border-white/[0.06] shadow-[0_20px_50px_rgba(0,0,0,0.15)] backdrop-blur-2xl bg-white/60 dark:bg-slate-950/45"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Welcome to UXVerse AI
          </h2>
          <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 mt-2">
            Sign in to continue your UX audit workspace
          </p>
        </div>

        {/* Error notification message */}
        <AnimatePresence>
          {errorMsg && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-xs font-bold text-red-500 dark:text-red-400 flex items-center gap-2 overflow-hidden"
            >
              <AlertCircle size={16} className="flex-shrink-0" />
              <span>{errorMsg}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Primary OAuth Method */}
        <GoogleButton onClick={onGoogleLogin} isLoading={isLoading} />

        {/* Divider */}
        <div className="relative flex py-4 items-center mt-2">
          <div className="flex-grow border-t border-slate-200 dark:border-white/[0.06]"></div>
          <span className="flex-shrink mx-4 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
            OR
          </span>
          <div className="flex-grow border-t border-slate-200 dark:border-white/[0.06]"></div>
        </div>

        {/* Secondary Authentication Option (email/password placeholders) */}
        <div className="space-y-4 opacity-50 select-none cursor-not-allowed">
          {/* Email input */}
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" size={18} />
            <input
              type="email"
              disabled
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email Address"
              className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 dark:border-white/[0.08] bg-slate-50/50 dark:bg-white/[0.03] text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 outline-none text-sm font-medium"
            />
          </div>

          {/* Password input */}
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" size={18} />
            <input
              type={showPassword ? "text" : "password"}
              disabled
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full pl-11 pr-12 py-3 rounded-xl border border-slate-200 dark:border-white/[0.08] bg-slate-50/50 dark:bg-white/[0.03] text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 outline-none text-sm font-medium"
            />
            <button
              type="button"
              disabled
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          <div className="flex justify-between items-center text-xs px-1">
            <span className="font-semibold text-slate-400 dark:text-slate-500">Remember me</span>
            <span className="font-semibold text-slate-400 dark:text-slate-500">Forgot password?</span>
          </div>

          <button
            disabled
            className="w-full py-3.5 rounded-xl bg-slate-200 dark:bg-white/[0.05] text-slate-400 dark:text-slate-500 font-bold text-sm select-none"
          >
            Sign In with Email
          </button>
        </div>

        {/* Footer info links inside card */}
        <div className="mt-8 text-center space-y-4">
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            Don't have an account?{" "}
            <span className="text-blue-500 dark:text-blue-400 font-bold opacity-60">
              Sign up
            </span>
          </p>
          <p className="text-[10px] text-slate-400 dark:text-slate-500 leading-relaxed max-w-[280px] mx-auto">
            By continuing, you agree to our{" "}
            <span className="underline hover:text-slate-600 dark:hover:text-slate-300 cursor-pointer">Terms of Service</span>{" "}
            and{" "}
            <span className="underline hover:text-slate-600 dark:hover:text-slate-300 cursor-pointer">Privacy Policy</span>.
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default AuthCard;
