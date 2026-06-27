import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Send, Loader2, Sparkles, Code2, User } from 'lucide-react';
import { useAudit } from '../context/AuditContext';

const suggestedPrompts = [
  { label: 'Explain Nielsen Heuristics', prompt: 'Explain Nielsen\'s 10 Usability Heuristics in detail.' },
  { label: 'Explain WCAG 2.2', prompt: 'Explain the WCAG 2.2 guidelines and their four main principles.' },
  { label: 'Generate Tailwind CSS', prompt: 'Generate a Tailwind CSS component for an accessible button with focus-visible outlines.' },
  { label: 'Mobile Responsiveness', prompt: 'How do I improve mobile responsiveness using Tailwind CSS?' },
  { label: 'Executive Summary', prompt: 'Generate an executive summary for this audit.' },
  { label: 'Improve Contrast', prompt: 'How do I fix low color contrast issues for WCAG 2.2 AA compliance?' },
];


const parseLineFormatting = (line: string): React.ReactNode[] => {
  const parts = line.split('**');
  return parts.map((part, index) => {
    if (index % 2 === 1) {
      return <strong key={index} className="text-white font-semibold">{part}</strong>;
    }
    return part;
  });
};

const parseCoachMessage = (text: string): React.ReactNode[] => {
  const lines = text.split('\n');
  const elements: React.ReactNode[] = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Check for Main Headings (## Heading)
    if (line.startsWith('## ')) {
      const headingText = line.replace('## ', '').trim();
      elements.push(
        <h2 key={i} className="text-[20px] font-bold text-white tracking-tight mt-6 mb-3 border-b border-white/[0.06] pb-2 flex items-center gap-2">
          {headingText.includes('Overview') && <Sparkles size={18} className="text-violet-400" />}
          {headingText.includes('Key Findings') && <Sparkles size={18} className="text-blue-400" />}
          {headingText.includes('Highest Priority Improvements') && <Sparkles size={18} className="text-amber-400" />}
          {headingText.includes('Expected User Impact') && <Sparkles size={18} className="text-emerald-400" />}
          {headingText.includes('Business Impact') && <Sparkles size={18} className="text-rose-400" />}
          {headingText.includes('Recommended Next Step') && <Sparkles size={18} className="text-sky-400" />}
          {headingText.includes('Need More Help') && <Sparkles size={18} className="text-indigo-400" />}
          {headingText}
        </h2>
      );
      continue;
    }
    
    // Check for Subheadings (### Subheading)
    if (line.startsWith('### ')) {
      const subHeadingText = line.replace('### ', '').trim();
      elements.push(
        <h3 key={i} className="text-[17px] font-semibold text-slate-100 mt-4 mb-2">
          {subHeadingText}
        </h3>
      );
      continue;
    }

    // Check for bullet points
    if (line.startsWith('• ') || line.startsWith('- ')) {
      const bulletText = line.substring(2).trim();
      elements.push(
        <div key={i} className="flex items-start gap-2.5 ml-4 my-2 text-slate-300">
          <span className="text-blue-400 mt-2 font-bold text-[10px]">•</span>
          <span className="flex-1 text-[16px] leading-[1.7]">{parseLineFormatting(bulletText)}</span>
        </div>
      );
      continue;
    }

    // Check for indentation list detail blocks
    if (line.includes('- **Severity**:') || line.includes('- **Why it matters**:') || line.includes('- **Expected impact**:') || line.includes('- **Estimated implementation effort**:') || line.includes('- **Recommendation**:')) {
      const cleanLine = line.replace(/^\s*[-•]\s*/, '').trim();
      elements.push(
        <div key={i} className="ml-7 my-1 text-[15px] leading-relaxed text-slate-400">
          {parseLineFormatting(cleanLine)}
        </div>
      );
      continue;
    }
    
    if (line === '') {
      elements.push(<div key={i} className="h-2" />);
      continue;
    }
    
    // Default paragraph text
    elements.push(
      <p key={i} className="text-slate-300 text-[16.5px] leading-[1.8] my-2 whitespace-pre-wrap">
        {parseLineFormatting(line)}
      </p>
    );
  }
  
  return elements;
};

const AICoach: React.FC = () => {
  const { coachMessages, sendCoachMessage } = useAudit();
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [coachMessages]);

  const handleSend = async () => {
    if (!inputText.trim() || isTyping) return;
    const text = inputText;
    setInputText('');
    setIsTyping(true);
    await sendCoachMessage(text);
    setIsTyping(false);
  };

  const handleSuggestedPrompt = (prompt: string) => {
    setInputText(prompt);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-6 py-4 border-b border-white/[0.06] flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
          <MessageSquare size={16} className="text-white" />
        </div>
        <div>
          <h1 className="font-bold text-white">AI UX Coach</h1>
          <p className="text-xs text-slate-400">Powered by Ollama (Gemma 3 4B) + Gemini</p>
        </div>
        <div className="ml-auto flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs text-emerald-400">Online</span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-5">
        <AnimatePresence>
          {coachMessages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex gap-3.5 ${ msg.sender === 'user' ? 'flex-row-reverse' : '' }`}
            >
              {/* Avatar */}
              <div className={`w-9 h-9 rounded-xl flex-shrink-0 flex items-center justify-center ${ msg.sender === 'coach' ? 'bg-gradient-to-br from-violet-500 to-purple-600' : 'bg-gradient-to-br from-blue-500 to-cyan-600' }`}>
                {msg.sender === 'coach' ? <Sparkles size={15} className="text-white" /> : <User size={15} className="text-white" />}
              </div>

              {/* Bubble */}
              <div className={`max-w-[80%] ${ msg.sender === 'user' ? 'items-end' : 'items-start' } flex flex-col gap-1.5`}>
                <div
                  className={`rounded-2xl ${msg.sender === 'coach' ? 'px-6 py-5 text-[17px] leading-[1.8]' : 'px-4.5 py-3 text-sm leading-relaxed'}`}
                  style={msg.sender === 'coach'
                    ? { background: 'rgba(15,23,42,0.65)', border: '1px solid rgba(255,255,255,0.06)' }
                    : { background: 'rgba(59,130,246,0.2)', border: '1px solid rgba(59,130,246,0.2)' }
                  }
                >
                  {msg.text === 'Thinking...' ? (
                    <span className="flex items-center gap-2 text-slate-400 text-sm"><Loader2 size={14} className="animate-spin" /> Thinking...</span>
                  ) : msg.sender === 'coach' ? (
                    <div className="text-slate-200 space-y-4">
                      {parseCoachMessage(msg.text)}
                    </div>
                  ) : (
                    <div className="text-slate-200 whitespace-pre-wrap">{msg.text}</div>
                  )}
                </div>

                {/* Code blocks */}
                {msg.codeBlocks?.map((block, bi) => (
                  <div key={bi} className="w-full max-w-2xl rounded-xl overflow-hidden text-sm mt-1" style={{ background: 'rgba(5,10,25,0.95)', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <div className="flex items-center gap-2 px-5 py-3 border-b border-white/[0.05]">
                      <Code2 size={14} className="text-slate-400" />
                      <span className="text-slate-400 font-medium">{block.language}</span>
                    </div>
                    <pre className="p-6 overflow-x-auto font-mono text-emerald-300 text-sm leading-relaxed">
                      <code>{block.code}</code>
                    </pre>
                  </div>
                ))}

                {/* Pipeline Logs */}
                {msg.pipelineLog && msg.pipelineLog.length > 0 && (
                  <details className="w-full max-w-xl text-[10px] text-slate-500 mt-1.5 cursor-pointer select-none">
                    <summary className="hover:text-slate-400 font-semibold focus:outline-none flex items-center gap-1.5 py-0.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />
                      SLM Decision Intelligence Cascade
                    </summary>
                    <div className="mt-1.5 p-2.5 rounded-xl bg-slate-950/60 border border-white/[0.04] space-y-1 font-mono text-[9px] leading-relaxed">
                      {msg.pipelineLog.map((log, li) => (
                        <p key={li} className="text-slate-400">{log}</p>
                      ))}
                    </div>
                  </details>
                )}

                <span className="text-[10px] text-slate-600 px-1 mt-1">{msg.timestamp}</span>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Prompts */}
      <div className="px-6 py-3.5 border-t border-white/[0.04]">
        <div className="flex gap-2.5 overflow-x-auto pb-1">
          {suggestedPrompts.map((p) => (
            <button
              key={p.label}
              onClick={() => handleSuggestedPrompt(p.prompt)}
              className="flex-shrink-0 px-4 py-2 rounded-xl text-sm font-medium text-slate-300 hover:text-white transition-all border border-white/[0.06] hover:border-blue-500/40 bg-white/[0.02] hover:bg-white/[0.05]"
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Input */}
      <div className="px-6 py-4 border-t border-white/[0.06]">
        <div className="flex gap-3">
          <input
            id="coach-chat-input"
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
            placeholder="Ask about UX issues, generate code fixes, or explain accessibility standards..."
            className="flex-1 px-4 py-3 rounded-xl text-sm text-white placeholder-slate-500 outline-none focus:ring-2 focus:ring-blue-500/30 transition-all"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
          />
          <motion.button
            id="send-coach-message-btn"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSend}
            disabled={!inputText.trim() || isTyping}
            className="bg-gradient-button px-4 py-3 rounded-xl text-white flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Send size={16} />
          </motion.button>
        </div>
      </div>
    </div>
  );
};

export default AICoach;
