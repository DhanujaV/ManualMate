import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Lock, Mail, Loader2, AlertCircle } from 'lucide-react';
import { useAudit } from '../../context/AuditContext';

const LoginForm: React.FC = () => {
  const { 
    login, 
    loginWithGoogle, 
    loginWithGithub, 
    theme 
  } = useAudit();

  const isDark = theme === 'dark';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingType, setLoadingType] = useState<'email' | 'google' | 'github' | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isShaking, setIsShaking] = useState(false);

  // States for secondary interactions (Forgot password / Sign up)
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all fields.');
      triggerShake();
      return;
    }

    setIsLoading(true);
    setLoadingType('email');
    setError(null);

    try {
      await login(email, password);
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.');
      triggerShake();
      setIsLoading(false);
      setLoadingType(null);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setLoadingType('google');
    setError(null);
    try {
      await loginWithGoogle();
    } catch (err: any) {
      setError('Google Sign-In failed.');
      triggerShake();
      setIsLoading(false);
      setLoadingType(null);
    }
  };

  const handleGithubLogin = async () => {
    setIsLoading(true);
    setLoadingType('github');
    setError(null);
    try {
      await loginWithGithub();
    } catch (err: any) {
      setError('GitHub Sign-In failed.');
      triggerShake();
      setIsLoading(false);
      setLoadingType(null);
    }
  };

  const triggerShake = () => {
    setIsShaking(true);
    setTimeout(() => setIsShaking(false), 500);
  };

  const shakeVariants = {
    shake: {
      x: [0, -10, 10, -10, 10, -5, 5, 0],
      transition: { duration: 0.4 }
    },
    idle: { x: 0 }
  };

  return (
    <div className="w-full space-y-6">
      {/* Toast Notification for unimplemented flows */}
      {toastMessage && (
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          className="fixed top-6 right-6 z-50 px-4 py-3 rounded-xl border shadow-lg text-sm font-medium glass-card border-blue-500/20 text-slate-200 flex items-center gap-2"
        >
          <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
          {toastMessage}
        </motion.div>
      )}

      {/* Error Alert Display */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          role="alert"
          aria-live="assertive"
          className="p-3.5 rounded-xl border flex items-start gap-3 text-sm text-red-400 bg-red-950/20 border-red-500/20"
        >
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-red-500" />
          <div>
            <p className="font-semibold">Authentication Error</p>
            <p className="opacity-90">{error}</p>
          </div>
        </motion.div>
      )}

      <motion.form 
        variants={shakeVariants}
        animate={isShaking ? "shake" : "idle"}
        onSubmit={handleEmailLogin} 
        className="space-y-4"
      >
        {/* Email Input */}
        <div className="relative group">
          <div className="absolute left-3.5 top-[18px] text-slate-400 group-focus-within:text-blue-500 transition-colors pointer-events-none">
            <Mail className="w-5 h-5" />
          </div>
          <input
            id="email"
            type="email"
            placeholder=" "
            value={email}
            disabled={isLoading}
            onChange={(e) => setEmail(e.target.value)}
            className="block w-full pl-11 pr-4 pt-6 pb-2 text-sm text-white bg-slate-900/40 dark:bg-slate-950/40 border border-slate-700/50 dark:border-slate-800/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 focus:bg-slate-900/60 transition-all peer disabled:opacity-50"
            style={{
              color: isDark ? '#ffffff' : '#0f172a',
              backgroundColor: isDark ? 'rgba(15, 23, 42, 0.35)' : 'rgba(255, 255, 255, 0.45)',
              borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'
            }}
          />
          <label
            htmlFor="email"
            className="absolute text-sm text-slate-400 dark:text-slate-500 duration-200 transform -translate-y-3.5 scale-75 top-5 z-10 origin-[0] left-11 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-3.5 peer-focus:text-blue-500 pointer-events-none"
          >
            Email Address
          </label>
        </div>

        {/* Password Input */}
        <div className="relative group">
          <div className="absolute left-3.5 top-[18px] text-slate-400 group-focus-within:text-purple-500 transition-colors pointer-events-none">
            <Lock className="w-5 h-5" />
          </div>
          <input
            id="password"
            type={showPassword ? "text" : "password"}
            placeholder=" "
            value={password}
            disabled={isLoading}
            onChange={(e) => setPassword(e.target.value)}
            className="block w-full pl-11 pr-11 pt-6 pb-2 text-sm text-white bg-slate-900/40 dark:bg-slate-950/40 border border-slate-700/50 dark:border-slate-800/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/40 focus:border-purple-500 focus:bg-slate-900/60 transition-all peer disabled:opacity-50"
            style={{
              color: isDark ? '#ffffff' : '#0f172a',
              backgroundColor: isDark ? 'rgba(15, 23, 42, 0.35)' : 'rgba(255, 255, 255, 0.45)',
              borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'
            }}
          />
          <label
            htmlFor="password"
            className="absolute text-sm text-slate-400 dark:text-slate-500 duration-200 transform -translate-y-3.5 scale-75 top-5 z-10 origin-[0] left-11 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-3.5 peer-focus:text-purple-500 pointer-events-none"
          >
            Password
          </label>
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            disabled={isLoading}
            className="absolute right-3.5 top-[18px] text-slate-400 hover:text-slate-200 transition-colors focus:outline-none"
          >
            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        </div>

        {/* Remember me & Forgot password */}
        <div className="flex items-center justify-between text-xs sm:text-sm pt-1">
          <label className="flex items-center gap-2 cursor-pointer group text-slate-400 hover:text-slate-300">
            <input
              type="checkbox"
              checked={rememberMe}
              disabled={isLoading}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="w-4 h-4 rounded border-slate-700 bg-slate-900/50 text-blue-600 focus:ring-blue-500 focus:ring-offset-slate-950 transition-colors"
            />
            <span>Remember me</span>
          </label>
          <button
            type="button"
            onClick={() => triggerToast("Password reset link sent to registered email (Simulated)")}
            disabled={isLoading}
            className="text-blue-400 hover:text-blue-300 transition-colors font-medium focus:outline-none"
          >
            Forgot password?
          </button>
        </div>

        {/* Primary Submit Button */}
        <motion.button
          type="submit"
          disabled={isLoading}
          whileHover={{ scale: isLoading ? 1 : 1.02 }}
          whileTap={{ scale: isLoading ? 1 : 0.98 }}
          className="relative w-full h-[52px] mt-4 flex items-center justify-center rounded-xl bg-gradient-button text-white font-semibold text-base shadow-lg shadow-blue-500/20 transition-all duration-200 cursor-pointer overflow-hidden disabled:opacity-75 disabled:cursor-not-allowed group"
        >
          {/* Subtle Glow Overlay on Hover */}
          <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
          
          {isLoading && loadingType === 'email' ? (
            <div className="flex items-center gap-2.5">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Verifying account...</span>
            </div>
          ) : (
            <span>Sign In</span>
          )}
        </motion.button>
      </motion.form>

      {/* Divider OR */}
      <div className="flex items-center my-6">
        <div className="flex-1 h-[1px] bg-slate-800" style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)' }} />
        <span className="px-4 text-xs font-semibold tracking-wider text-slate-500 bg-transparent">OR</span>
        <div className="flex-1 h-[1px] bg-slate-800" style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)' }} />
      </div>

      {/* Secondary Social Login Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {/* Google SSO */}
        <motion.button
          type="button"
          onClick={handleGoogleLogin}
          disabled={isLoading}
          whileHover={{ y: isLoading ? 0 : -2 }}
          whileTap={{ scale: isLoading ? 1 : 0.98 }}
          className="flex items-center justify-center gap-2.5 px-4 py-3 rounded-xl border text-sm font-semibold transition-all duration-250 cursor-pointer disabled:opacity-50"
          style={{
            color: isDark ? '#f1f5f9' : '#0f172a',
            backgroundColor: isDark ? 'rgba(255, 255, 255, 0.02)' : 'rgba(0, 0, 0, 0.02)',
            borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)',
          }}
        >
          {isLoading && loadingType === 'google' ? (
            <Loader2 className="w-5 h-5 animate-spin text-slate-400" />
          ) : (
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="#EA4335"
                d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.114-5.136 4.114-3.565 0-6.452-2.887-6.452-6.452s2.887-6.452 6.452-6.452c1.728 0 3.3.68 4.464 1.778l3.155-3.155C18.665 1.488 15.656.5 12.24.5 5.866.5.7 5.666.7 12.04S5.866 23.58 12.24 23.58c5.96 0 11.232-4.148 11.232-11.232 0-.696-.06-1.392-.168-2.064H12.24Z"
              />
            </svg>
          )}
          <span>Google</span>
        </motion.button>

        {/* GitHub SSO */}
        <motion.button
          type="button"
          onClick={handleGithubLogin}
          disabled={isLoading}
          whileHover={{ y: isLoading ? 0 : -2 }}
          whileTap={{ scale: isLoading ? 1 : 0.98 }}
          className="flex items-center justify-center gap-2.5 px-4 py-3 rounded-xl border text-sm font-semibold transition-all duration-250 cursor-pointer disabled:opacity-50"
          style={{
            color: isDark ? '#f1f5f9' : '#0f172a',
            backgroundColor: isDark ? 'rgba(255, 255, 255, 0.02)' : 'rgba(0, 0, 0, 0.02)',
            borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)',
          }}
        >
          {isLoading && loadingType === 'github' ? (
            <Loader2 className="w-5 h-5 animate-spin text-slate-400" />
          ) : (
            <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
              <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
            </svg>
          )}
          <span>GitHub</span>
        </motion.button>
      </div>

      {/* Footer link to sign up */}
      <div className="text-center pt-2">
        <p className="text-sm text-slate-400">
          Don’t have an account?{' '}
          <button
            type="button"
            onClick={() => triggerToast("Registration flow under construction. Please use Google/GitHub sign-in.")}
            disabled={isLoading}
            className="text-purple-400 hover:text-purple-300 font-semibold transition-colors focus:outline-none"
          >
            Sign up
          </button>
        </p>
        <p className="text-[11px] text-slate-500 mt-4 max-w-xs mx-auto leading-relaxed">
          By continuing you agree to our{' '}
          <a href="#" className="underline hover:text-slate-400 transition-colors">Terms of Service</a>
          {' '}and{' '}
          <a href="#" className="underline hover:text-slate-400 transition-colors">Privacy Policy</a>.
        </p>
      </div>
    </div>
  );
};

export default LoginForm;
