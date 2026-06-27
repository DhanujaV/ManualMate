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
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
        <AnimatePresence>
          {coachMessages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex gap-3 ${ msg.sender === 'user' ? 'flex-row-reverse' : '' }`}
            >
              {/* Avatar */}
              <div className={`w-8 h-8 rounded-xl flex-shrink-0 flex items-center justify-center ${ msg.sender === 'coach' ? 'bg-gradient-to-br from-violet-500 to-purple-600' : 'bg-gradient-to-br from-blue-500 to-cyan-600' }`}>
                {msg.sender === 'coach' ? <Sparkles size={14} className="text-white" /> : <User size={14} className="text-white" />}
              </div>

              {/* Bubble */}
              <div className={`max-w-[75%] ${ msg.sender === 'user' ? 'items-end' : 'items-start' } flex flex-col gap-1`}>
                <div
                  className="px-4 py-3 rounded-2xl text-sm leading-relaxed"
                  style={msg.sender === 'coach'
                    ? { background: 'rgba(15,23,42,0.6)', border: '1px solid rgba(255,255,255,0.06)' }
                    : { background: 'rgba(59,130,246,0.2)', border: '1px solid rgba(59,130,246,0.2)' }
                  }
                >
                  {msg.text === 'Thinking...' ? (
                    <span className="flex items-center gap-2 text-slate-400"><Loader2 size={14} className="animate-spin" /> Thinking...</span>
                  ) : (
                    <div className="text-slate-200 whitespace-pre-wrap">
                      {msg.text.split('\n').map((line, li) => (
                        <React.Fragment key={li}>
                          {line.startsWith('**') && line.endsWith('**') ? (
                            <strong className="text-white">{line.slice(2, -2)}</strong>
                          ) : line.startsWith('###') ? (
                            <strong className="text-blue-300 block mt-2">{line.replace('###', '').trim()}</strong>
                          ) : (
                            line
                          )}
                          {li < msg.text.split('\n').length - 1 && <br />}
                        </React.Fragment>
                      ))}
                    </div>
                  )}
                </div>

                {/* Code blocks */}
                {msg.codeBlocks?.map((block, bi) => (
                  <div key={bi} className="w-full max-w-xl rounded-xl overflow-hidden text-xs" style={{ background: 'rgba(5,10,25,0.9)', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <div className="flex items-center gap-2 px-4 py-2 border-b border-white/[0.05]">
                      <Code2 size={12} className="text-slate-400" />
                      <span className="text-slate-400">{block.language}</span>
                    </div>
                    <pre className="p-4 overflow-x-auto font-mono text-emerald-300 text-xs leading-relaxed">
                      <code>{block.code}</code>
                    </pre>
                  </div>
                ))}

                <span className="text-[10px] text-slate-600 px-1">{msg.timestamp}</span>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Prompts */}
      <div className="px-6 py-3 border-t border-white/[0.04]">
        <div className="flex gap-2 overflow-x-auto pb-1">
          {suggestedPrompts.map((p) => (
            <button
              key={p.label}
              onClick={() => handleSuggestedPrompt(p.prompt)}
              className="flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-slate-200 transition-all border border-white/[0.06] hover:border-blue-500/30"
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
