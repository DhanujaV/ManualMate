import React from 'react';
import { motion } from 'framer-motion';
import {
  Zap, Shield, Eye, GitCompare, MessageSquare, TrendingUp,
  ArrowRight, Globe, CheckCircle, Star, BarChart3
} from 'lucide-react';
import { useAudit } from '../context/AuditContext';

const features = [
  { icon: Globe, title: 'Autonomous Web Crawling', description: 'Explorer Agent maps every reachable page of your website, building a complete structural sitemap automatically.', color: 'from-blue-500 to-cyan-500' },
  { icon: Eye, title: 'Gemini Vision Analysis', description: 'Vision Agent screenshots each page and uses Gemini 2.5 Vision AI to detect visual UX flaws invisible to code scanners.', color: 'from-violet-500 to-purple-500' },
  { icon: Shield, title: 'WCAG 2.2 Accessibility', description: 'Full accessibility evaluation mapping to all WCAG 2.2 A/AA/AAA criteria using axe-core pattern detection.', color: 'from-emerald-500 to-teal-500' },
  { icon: GitCompare, title: 'Before vs After Code', description: 'Monaco Editor split-screen shows current HTML/CSS side-by-side with AI-generated fixes you can copy instantly.', color: 'from-rose-500 to-orange-500' },
  { icon: MessageSquare, title: 'Interactive AI Coach', description: 'Conversational SLM assistant powered by local Ollama model answers UX questions, generates code, and explains heuristics.', color: 'from-amber-500 to-yellow-500' },
  { icon: TrendingUp, title: 'Progress Intelligence', description: 'Track UX and accessibility improvements across multiple audits with timeline charts and AI-generated summary reports.', color: 'from-sky-500 to-indigo-500' },
];

const workflowSteps = [
  { step: 1, agent: 'Explorer Agent', action: 'Crawls every reachable internal page', icon: Globe },
  { step: 2, agent: 'Vision Agent', action: 'Analyzes screenshots with Gemini 2.5', icon: Eye },
  { step: 3, agent: 'UX Evaluator', action: 'Applies Nielsen\'s 10 Heuristics', icon: Zap },
  { step: 4, agent: 'Accessibility Engine', action: 'Validates WCAG 2.2 compliance', icon: Shield },
  { step: 5, agent: 'Persona Simulator', action: 'Evaluates 5 user personas', icon: MessageSquare },
  { step: 6, agent: 'Business Impact Agent', action: 'Calculates revenue & conversion lift', icon: TrendingUp },
  { step: 7, agent: 'Prioritization Agent', action: 'Selects Top 3 highest-impact fixes', icon: GitCompare },
];

const pricingPlans = [
  { name: 'Starter', price: '$0', period: 'forever', features: ['3 audits/month', '5 pages per audit', 'Basic UX report', 'Email support'], popular: false },
  { name: 'Professional', price: '$49', period: '/month', features: ['Unlimited audits', '50 pages per audit', 'Full WCAG analysis', 'AI UX Coach', 'Before/After code', 'Priority support'], popular: true },
  { name: 'Enterprise', price: 'Custom', period: '', features: ['Unlimited pages', 'API access', 'Custom personas', 'White-label reports', 'Dedicated account manager', 'SLA guarantee'], popular: false },
];

const LandingPage: React.FC = () => {
  const { setActiveTab } = useAudit();

  return (
<<<<<<< HEAD
    <div className="min-h-screen overflow-x-hidden relative">
      {/* Top Navbar */}
      <header className="absolute top-0 inset-x-0 w-full z-50 bg-transparent">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center shadow-lg shadow-blue-500/10">
              <BarChart3 size={16} className="text-white" />
            </div>
            <span className="font-bold text-white tracking-tight text-lg">UXVerse <span className="text-blue-400">AI</span></span>
          </div>
          <nav className="hidden md:flex items-center gap-8 text-sm text-slate-400 font-medium">
            <a href="#" className="hover:text-white transition-colors">Features</a>
            <a href="#" className="hover:text-white transition-colors">Workflow</a>
            <a href="#" className="hover:text-white transition-colors">Pricing</a>
          </nav>
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setActiveTab('login')} 
              className="text-sm font-semibold text-slate-300 hover:text-white transition-colors cursor-pointer"
            >
              Sign In
            </button>
            <button 
              onClick={() => setActiveTab('auditor')} 
              className="bg-white/10 hover:bg-white/15 text-white border border-white/10 px-4 py-2 rounded-xl text-sm font-semibold transition-all cursor-pointer"
            >
              Start Free
            </button>
          </div>
=======
    <div className="min-h-screen overflow-x-hidden flex flex-col">
      {/* Sticky Header Navbar */}
      <header className="sticky top-0 z-50 w-full px-6 py-4 flex items-center justify-between border-b border-white/[0.04] backdrop-blur-md" style={{ background: 'rgba(6, 8, 20, 0.7)' }}>
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => setActiveTab('landing')}>
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center">
            <Zap size={16} className="text-white" />
          </div>
          <span className="font-extrabold text-white text-base tracking-tight">UXVerse AI</span>
        </div>
        
        <nav className="hidden md:flex items-center gap-6 text-sm font-semibold text-slate-400">
          <a href="#features" className="hover:text-white transition-colors">Features</a>
          <a href="#workflow" className="hover:text-white transition-colors">Workflow</a>
          <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
        </nav>

        <div className="flex items-center gap-4">
          <button 
            onClick={() => setActiveTab('login')} 
            className="text-sm font-bold text-slate-300 hover:text-white transition-colors"
          >
            Sign In
          </button>
          <button 
            onClick={() => setActiveTab('auditor')} 
            className="bg-gradient-button px-4 py-2 rounded-xl text-xs font-bold text-white shadow-md shadow-blue-500/10 hover:shadow-blue-500/20 active:scale-98 transition-all"
          >
            Start Free Audit
          </button>
>>>>>>> 5bc2c5caeb8aa7b97340a9e14ea62c500517cdc8
        </div>
      </header>

      {/* Hero */}
      <section className="relative min-h-screen flex flex-col items-center justify-center text-center px-6 py-20">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full" style={{ background: 'radial-gradient(circle, rgba(59,130,246,0.08) 0%, transparent 70%)' }} />
          <div className="absolute top-1/3 left-1/4 w-64 h-64 rounded-full" style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.06) 0%, transparent 70%)' }} />
          <div className="absolute top-1/2 right-1/4 w-48 h-48 rounded-full" style={{ background: 'radial-gradient(circle, rgba(16,185,129,0.05) 0%, transparent 70%)' }} />

          {/* Floating UI cards decoration */}
          <motion.div
            animate={{ y: [-8, 8, -8] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute top-32 left-16 hidden xl:block"
          >
            <div className="glass-card p-4 rounded-2xl w-52">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-6 h-6 rounded-lg bg-emerald-500/20 flex items-center justify-center"><Shield size={12} className="text-emerald-400" /></div>
                <span className="text-xs font-medium text-slate-300">Accessibility</span>
              </div>
              <div className="text-3xl font-bold text-white mb-1">94<span className="text-lg text-slate-400">/100</span></div>
              <div className="h-1.5 rounded-full bg-white/10"><div className="h-full w-[94%] rounded-full bg-emerald-500" /></div>
            </div>
          </motion.div>

          <motion.div
            animate={{ y: [6, -6, 6] }}
            transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
            className="absolute top-48 right-20 hidden xl:block"
          >
            <div className="glass-card p-4 rounded-2xl w-52">
              <p className="text-[10px] text-red-400 font-semibold mb-2">⚠ CRITICAL ISSUE</p>
              <p className="text-xs text-slate-300">Missing alt text on 3 hero images</p>
              <p className="text-[10px] text-slate-500 mt-1">WCAG 2.2 — 1.1.1 Non-text Content</p>
            </div>
          </motion.div>

          <motion.div
            animate={{ y: [-5, 5, -5] }}
            transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
            className="absolute bottom-32 left-24 hidden xl:block"
          >
            <div className="glass-card p-4 rounded-2xl w-48">
              <p className="text-[10px] text-violet-400 font-semibold mb-2">AI RECOMMENDATION</p>
              <p className="text-xs text-slate-300">Add guest checkout to reduce cart abandonment by 28%</p>
            </div>
          </motion.div>
        </div>

        {/* Hero content */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative z-10 max-w-4xl mx-auto"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-8 text-sm font-medium text-blue-300 border border-blue-500/20"
            style={{ background: 'rgba(59,130,246,0.08)' }}
          >
            <Zap size={12} className="text-blue-400" />
            Powered by Gemini AI + Local SLM — Enterprise Ready
          </motion.div>

          <h1 className="text-5xl md:text-7xl font-extrabold leading-tight mb-6">
            <span className="text-white">AI-Powered</span>{' '}
            <span className="text-gradient-brand">UX Auditor</span>{' '}
            <span className="text-white">for the Modern Web</span>
          </h1>

          <p className="text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed mb-10">
            UXVerse AI autonomously crawls your website, analyzes every page with AI vision,
            evaluates against Nielsen Heuristics & WCAG 2.2, and delivers implementation-ready
            fixes — in minutes, not weeks.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setActiveTab('auditor')}
              className="bg-gradient-button px-8 py-4 rounded-2xl font-semibold text-white text-lg flex items-center gap-2 shadow-xl"
              style={{ boxShadow: '0 0 30px rgba(59,130,246,0.3)' }}
            >
              Start Free Audit
              <ArrowRight size={20} />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setActiveTab('overall')}
              className="px-8 py-4 rounded-2xl font-semibold text-slate-300 border border-white/10 text-lg hover:bg-white/[0.03] transition-all"
            >
              View Demo
            </motion.button>
          </div>

          {/* Social proof */}
          <div className="flex items-center justify-center gap-6 mt-12 text-sm text-slate-500">
            {['WCAG 2.2 Compliant', 'Nielsen Heuristics', 'GDPR Ready', 'Enterprise Grade'].map((t) => (
              <span key={t} className="flex items-center gap-1.5"><CheckCircle size={12} className="text-emerald-400" />{t}</span>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-white mb-4">Every Tool You Need to Ship Accessible, Usable Products</h2>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto">From autonomous crawling to AI-generated code fixes, UXVerse covers the entire UX audit lifecycle.</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="glass-card glass-card-hover p-6 rounded-2xl"
              >
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${f.color} flex items-center justify-center mb-4 shadow-lg`}>
                  <f.icon size={22} className="text-white" />
                </div>
                <h3 className="font-semibold text-white text-lg mb-2">{f.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{f.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Workflow Animation */}
      <section id="workflow" className="py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-white mb-4">7-Agent Autonomous Workflow</h2>
            <p className="text-slate-400 text-lg">Each specialized AI agent handles a distinct phase of the audit pipeline.</p>
          </motion.div>

          <div className="space-y-3">
            {workflowSteps.map((step, i) => (
              <motion.div
                key={step.step}
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="flex items-center gap-5 glass-card p-5 rounded-2xl"
              >
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-violet-600 flex items-center justify-center flex-shrink-0 font-bold text-white text-sm">{step.step}</div>
                <step.icon size={18} className="text-slate-400 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-white text-sm">{step.agent}</p>
                  <p className="text-slate-400 text-xs mt-0.5">{step.action}</p>
                </div>
                {i < workflowSteps.length - 1 && (
                  <div className="ml-auto text-slate-600">
                    <ArrowRight size={16} />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-white mb-4">Simple, Transparent Pricing</h2>
            <p className="text-slate-400 text-lg">Start free. Scale when you're ready.</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {pricingPlans.map((plan, i) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className={`glass-card p-8 rounded-2xl relative ${ plan.popular ? 'border-blue-500/30' : '' }`}
                style={plan.popular ? { borderColor: 'rgba(59,130,246,0.3)', boxShadow: '0 0 30px rgba(59,130,246,0.1)' } : {}}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-blue-600 to-violet-600 rounded-full text-xs font-semibold text-white">
                    Most Popular
                  </div>
                )}
                <h3 className="text-lg font-bold text-white mb-2">{plan.name}</h3>
                <div className="mb-6">
                  <span className="text-4xl font-extrabold text-white">{plan.price}</span>
                  <span className="text-slate-400">{plan.period}</span>
                </div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm text-slate-300">
                      <CheckCircle size={14} className="text-emerald-400 flex-shrink-0" />{f}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => setActiveTab('auditor')}
                  className={`w-full py-3 rounded-xl font-semibold text-sm transition-all duration-200 ${ plan.popular ? 'bg-gradient-button text-white' : 'border border-white/10 text-slate-300 hover:bg-white/[0.04]' }`}
                >
                  {plan.price === 'Custom' ? 'Contact Sales' : 'Get Started'}
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-3xl mx-auto text-center glass-card p-16 rounded-3xl"
          style={{ border: '1px solid rgba(59,130,246,0.15)' }}
        >
          <div className="flex justify-center mb-6">
            {[...Array(5)].map((_, i) => <Star key={i} size={20} className="text-amber-400 fill-amber-400" />)}
          </div>
          <h2 className="text-4xl font-bold text-white mb-4">Ready to Transform Your UX?</h2>
          <p className="text-slate-400 text-lg mb-8">Join forward-thinking teams using UXVerse AI to ship accessible, user-centered products faster.</p>
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setActiveTab('auditor')}
            className="bg-gradient-button px-10 py-4 rounded-2xl font-semibold text-white text-lg inline-flex items-center gap-2"
            style={{ boxShadow: '0 0 40px rgba(59,130,246,0.25)' }}
          >
            Launch Your First Audit
            <ArrowRight size={20} />
          </motion.button>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/[0.06] py-12 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center">
              <Zap size={14} className="text-white" />
            </div>
            <span className="font-bold text-white">UXVerse AI</span>
          </div>
          <p className="text-slate-500 text-sm">© 2026 UXVerse AI. Built for the future of accessible, human-centered design.</p>
          <div className="flex gap-6 text-sm text-slate-400">
            {['Privacy', 'Terms', 'Docs', 'API'].map((l) => <a key={l} href="#" className="hover:text-white transition-colors">{l}</a>)}
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
