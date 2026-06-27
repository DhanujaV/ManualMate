import React from 'react';
import { motion } from 'framer-motion';

interface GoogleButtonProps {
  onClick: () => void;
  isLoading: boolean;
  disabled?: boolean;
}

export const GoogleButton: React.FC<GoogleButtonProps> = ({ onClick, isLoading, disabled }) => {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      disabled={isLoading || disabled}
      whileHover={!(isLoading || disabled) ? { scale: 1.02, y: -1 } : {}}
      whileTap={!(isLoading || disabled) ? { scale: 0.98 } : {}}
      className={`w-full flex items-center justify-center gap-3 py-4 px-5 rounded-2xl border border-slate-200 dark:border-white/[0.08] bg-white dark:bg-white/[0.03] hover:bg-slate-50 dark:hover:bg-white/[0.06] text-sm font-extrabold text-slate-800 dark:text-slate-200 shadow-sm transition-all duration-300 relative overflow-hidden group ${
        (isLoading || disabled) ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'
      }`}
      style={{
        boxShadow: !(isLoading || disabled) ? '0 4px 20px rgba(59, 130, 246, 0.05)' : 'none'
      }}
    >
      {/* Sliding gradient glow shift */}
      <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-emerald-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

      {isLoading ? (
        <div className="flex items-center gap-2.5 relative z-10">
          <svg className="animate-spin h-4 w-4 text-slate-500 dark:text-white" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <span className="tracking-tight">Connecting to workspace...</span>
        </div>
      ) : (
        <div className="flex items-center justify-center gap-2.5 relative z-10">
          {/* Google Logo SVG */}
          <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
          </svg>
          <span className="tracking-tight">Continue with Google</span>
        </div>
      )}
    </motion.button>
  );
};

export default GoogleButton;
