import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  Bot,
  User,
  Plus,
  Send,
  Mic,
  Copy,
  Check,
  Code2,
  Compass,
  Lightbulb,
  FileCode,
  Square
} from 'lucide-react';
import type { ChatMessage } from './ChatPanel';
import { AstraLogo } from './AstraLogo';
import type { AstraOrbState } from './AstraOrb';

interface AstraChatScreenProps {
  messages: ChatMessage[];
  currentResponse?: string | null;
  onSend: (text: string) => void;
  onToggleVoice: () => void;
  isRecording: boolean;
  state: AstraOrbState | string;
  onNewChat: () => void;
  className?: string;
}

export const AstraChatScreen: React.FC<AstraChatScreenProps> = ({
  messages,
  currentResponse,
  onSend,
  onToggleVoice,
  isRecording,
  state,
  onNewChat,
  className = ''
}) => {
  const [input, setInput] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const isListening = isRecording || String(state).toUpperCase().includes('LISTEN');

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, currentResponse]);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (input.trim()) {
      onSend(input.trim());
      setInput('');
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const samplePrompts = [
    {
      title: 'Analyze & Architecture',
      desc: 'Architect a scalable multi-agent microservice architecture',
      icon: Code2,
      prompt: 'Architect a scalable multi-agent microservice architecture with low-latency event queues.'
    },
    {
      title: 'Explore & Research',
      desc: 'Discover cutting-edge breakthroughs in humanoid robotics',
      icon: Compass,
      prompt: 'Summarize the latest breakthroughs in humanoid robotics kinematics and neural motion planning.'
    },
    {
      title: 'Brainstorm Solutions',
      desc: 'Design a resilient autonomous cloud deployment strategy',
      icon: Lightbulb,
      prompt: 'Provide an autonomous cloud deployment workflow with automated canary testing and rollback.'
    },
    {
      title: 'Generate Full Code',
      desc: 'Build a production WebGL shader with Three.js',
      icon: FileCode,
      prompt: 'Write a production Three.js custom shader material featuring fractal Brownian motion caustics.'
    }
  ];

  return (
    <div className={`w-full h-[calc(100vh-80px)] flex flex-col justify-between max-w-5xl mx-auto px-4 pb-6 select-text ${className}`}>
      {/* 1. Header Toolbar */}
      <div className="flex items-center justify-between py-2 border-b border-white/[0.06] select-none">
        <div className="flex items-center gap-3">
          <AstraLogo size="sm" align="left" showSubtitle={false} />
          <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full liquid-glass-pill text-cyan-300">
            GPT-4o &amp; Claude 3.5 Neural Mesh
          </span>
        </div>

        <button
          type="button"
          onClick={onNewChat}
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-2xl liquid-glass-chip text-xs font-medium text-white/80 hover:text-white transition-all shadow-sm active:scale-95"
        >
          <Plus className="w-3.5 h-3.5 text-cyan-400" />
          <span>New Chat</span>
        </button>
      </div>

      {/* 2. Chat Conversation Feed / Empty Gemini-style State */}
      <div className="flex-1 overflow-y-auto astra-scrollbar py-6 flex flex-col gap-6">
        {messages.length === 0 ? (
          <div className="my-auto flex flex-col items-center justify-center gap-8 py-8 animate-in fade-in zoom-in-95 duration-500">
            <div className="flex flex-col items-center text-center gap-3">
              <div className="w-14 h-14 rounded-3xl liquid-glass-pill flex items-center justify-center text-cyan-300 shadow-[0_0_30px_rgba(0,191,255,0.35)]">
                <Sparkles className="w-7 h-7 text-cyan-400 animate-pulse" />
              </div>
              <h1 className="text-3xl font-extrabold tracking-[0.2em] text-transparent bg-clip-text bg-gradient-to-r from-white via-cyan-100 to-[#00BFFF]">
                HOW CAN ASTRA ASSIST YOU?
              </h1>
              <p className="text-xs font-mono text-white/50 tracking-wider">
                Ask questions, generate architecture, analyze code, or direct autonomous workflows.
              </p>
            </div>

            {/* Prompt Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 w-full max-w-3xl">
              {samplePrompts.map((card, idx) => {
                const Icon = card.icon;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => onSend(card.prompt)}
                    className="p-4 rounded-2xl liquid-glass-card text-left flex items-start gap-3.5 hover:scale-[1.01] hover:border-cyan-500/40 transition-all group"
                  >
                    <div className="p-2.5 rounded-xl liquid-glass-pill text-cyan-400 group-hover:text-cyan-300 transition-colors shrink-0">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-xs font-bold text-white group-hover:text-cyan-200 transition-colors">
                        {card.title}
                      </span>
                      <span className="text-[11px] text-white/60 font-sans leading-relaxed">
                        {card.desc}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          /* Full Chat Thread */
          <div className="flex flex-col gap-5 max-w-4xl mx-auto w-full">
            {messages.map((msg) => {
              const isUser = msg.sender === 'user';

              return (
                <div
                  key={msg.id}
                  className={`flex items-start gap-4 p-5 rounded-3xl transition-all animate-in fade-in slide-in-from-bottom-2 ${
                    isUser
                      ? 'liquid-glass-card ml-auto max-w-[80%] border-white/10 text-white'
                      : 'liquid-glass mr-auto max-w-[95%] border-cyan-500/20 shadow-[0_15px_40px_rgba(0,0,0,0.6)]'
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-2xl flex items-center justify-center shrink-0 mt-0.5 ${
                      isUser
                        ? 'liquid-glass-card text-white/80'
                        : 'bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 shadow-[0_0_15px_rgba(0,191,255,0.4)]'
                    }`}
                  >
                    {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                  </div>

                  <div className="flex flex-col flex-1 gap-2">
                    <div className="flex items-center justify-between">
                      <span
                        className={`text-[10px] font-mono tracking-wider uppercase font-semibold ${
                          isUser ? 'text-white/40' : 'text-cyan-400'
                        }`}
                      >
                        {isUser ? 'YOU' : 'ASTRA AI'}
                      </span>
                      {!isUser && (
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleCopy(msg.id, msg.text)}
                            className="text-white/40 hover:text-cyan-300 p-1.5 rounded-lg transition-colors"
                            title="Copy response"
                          >
                            {copiedId === msg.id ? (
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="text-sm text-[#E6F7FF] font-sans leading-relaxed whitespace-pre-wrap selection:bg-cyan-500/30">
                      {msg.text}
                    </div>

                    {/* Contextual Action Buttons */}
                    {msg.actions && msg.actions.length > 0 && (
                      <div className="flex flex-wrap items-center gap-2 mt-2 pt-2 border-t border-white/10">
                        {msg.actions.map((act, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={act.onClick}
                            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                              act.variant === 'primary'
                                ? 'bg-gradient-to-r from-[#00BFFF] to-blue-600 text-white shadow-[0_0_15px_rgba(0,191,255,0.4)] hover:brightness-110 active:scale-95'
                                : 'liquid-glass-chip text-white/80'
                            }`}
                          >
                            <span>{act.label}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Live Streaming Response Preview */}
            {currentResponse && (
              <div className="flex items-start gap-4 p-5 rounded-3xl liquid-glass mr-auto max-w-[95%] border-cyan-500/40 shadow-[0_0_30px_rgba(0,191,255,0.25)] animate-pulse">
                <div className="w-8 h-8 rounded-2xl bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 flex items-center justify-center shrink-0 mt-0.5 shadow-[0_0_15px_rgba(0,191,255,0.4)]">
                  <Sparkles className="w-4 h-4 text-cyan-400 animate-spin" />
                </div>
                <div className="flex flex-col flex-1 gap-1">
                  <span className="text-[10px] font-mono tracking-wider uppercase font-semibold text-cyan-300">
                    ASTRA SYNTHESIZING...
                  </span>
                  <div className="text-sm text-[#E6F7FF] font-sans leading-relaxed whitespace-pre-wrap">
                    {currentResponse}
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* 3. Bottom Gemini/ChatGPT Style Input Bar */}
      <div className="w-full max-w-4xl mx-auto flex flex-col gap-2 select-none">
        <form
          onSubmit={handleSubmit}
          className={`relative flex items-center gap-3.5 px-6 py-3.5 rounded-3xl liquid-glass-input transition-all duration-300 ${
            isListening
              ? 'border-2 border-[#00BFFF] shadow-[0_0_35px_rgba(0,191,255,0.5)] ring-2 ring-cyan-500/30'
              : ''
          }`}
        >
          {/* Left Sparkles */}
          <div className="flex items-center justify-center shrink-0">
            {isListening ? (
              <div className="flex items-center gap-1">
                <span className="w-1.5 h-4 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-1.5 h-6 bg-cyan-300 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-1.5 h-3 bg-cyan-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            ) : (
              <Sparkles className="w-5 h-5 text-cyan-400/80" />
            )}
          </div>

          {/* Textarea */}
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              e.target.style.height = 'auto';
              e.target.style.height = `${Math.min(e.target.scrollHeight, 160)}px`;
            }}
            onKeyDown={handleKeyDown}
            rows={1}
            placeholder={isListening ? 'Listening to voice...' : 'Ask ASTRA anything... (Shift+Enter for newline)'}
            className="flex-1 bg-transparent text-sm text-[#E6F7FF] placeholder-white/40 resize-none outline-none font-sans leading-relaxed max-h-36"
          />

          {/* Right Buttons */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Mic Toggle */}
            <button
              type="button"
              onClick={onToggleVoice}
              title={isListening ? 'Stop voice recording' : 'Speak with voice'}
              className={`p-2.5 rounded-2xl transition-all flex items-center justify-center ${
                isListening
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/50 shadow-[0_0_20px_rgba(244,63,94,0.5)] animate-pulse'
                  : 'liquid-glass-pill text-cyan-300 hover:scale-105 active:scale-95'
              }`}
            >
              {isListening ? <Square className="w-4 h-4 fill-current" /> : <Mic className="w-4 h-4" />}
            </button>

            {/* Send Button */}
            <button
              type="submit"
              disabled={!input.trim()}
              title="Send message"
              className={`p-2.5 rounded-2xl transition-all flex items-center justify-center ${
                input.trim()
                  ? 'bg-gradient-to-r from-[#00BFFF] to-blue-600 text-white shadow-[0_0_20px_rgba(0,191,255,0.55)] hover:brightness-110 active:scale-95'
                  : 'bg-white/[0.04] text-white/30 cursor-not-allowed border border-white/[0.06]'
              }`}
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </form>

        <div className="text-center text-[10px] font-mono text-white/30">
          ASTRA can make mistakes. Verify critical system directives and telemetry.
        </div>
      </div>
    </div>
  );
};

export default AstraChatScreen;
