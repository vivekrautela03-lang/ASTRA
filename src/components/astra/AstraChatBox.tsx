import React, { useRef, useEffect } from 'react';
import {
  Sparkles,
  Bot,
  User,
  X,
  Copy,
  Check,
  ChevronRight,
  Trash2,
  Minimize2,
  Maximize2
} from 'lucide-react';
import type { ChatMessage } from './ChatPanel';
import { CommandBar } from './CommandBar';
import { QuickCommands } from './QuickCommands';
import type { AstraOrbState } from './AstraOrb';

interface AstraChatBoxProps {
  isOpen: boolean;
  onClose: () => void;
  messages: ChatMessage[];
  currentResponse?: string | null;
  onSend: (text: string) => void;
  onToggleVoice: () => void;
  isRecording: boolean;
  state: AstraOrbState | string;
  onClearHistory?: () => void;
  className?: string;
}

export const AstraChatBox: React.FC<AstraChatBoxProps> = ({
  isOpen,
  onClose,
  messages,
  currentResponse,
  onSend,
  onToggleVoice,
  isRecording,
  state,
  onClearHistory,
  className = ''
}) => {
  const [copiedId, setCopiedId] = React.useState<string | null>(null);
  const [isExpanded, setIsExpanded] = React.useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of conversation
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, currentResponse, isOpen]);

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (!isOpen) {
    // Collapsed standard bottom command bar
    return (
      <div className={`w-full max-w-3xl flex flex-col items-center gap-3 select-none ${className}`}>
        <QuickCommands onSelectCommand={onSend} />
        <div className="relative w-full flex items-center">
          <CommandBar
            onSend={onSend}
            onToggleVoice={onToggleVoice}
            isRecording={isRecording}
            state={state as AstraOrbState}
          />
        </div>
      </div>
    );
  }

  // Expanded Translucent Liquid Glass Chat HUD
  return (
    <div
      className={`w-full ${
        isExpanded ? 'max-w-4xl h-[620px]' : 'max-w-3xl h-[460px]'
      } flex flex-col rounded-3xl liquid-glass shadow-[0_25px_60px_rgba(0,0,0,0.9)] transition-all duration-300 overflow-hidden select-text z-30 ${className}`}
    >
      {/* 1. Liquid Glass Header */}
      <div className="flex items-center justify-between px-6 py-3.5 border-b border-white/[0.09] bg-white/[0.02] backdrop-blur-xl select-none">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-xl liquid-glass-pill flex items-center justify-center text-cyan-300 shadow-[0_0_12px_rgba(0,191,255,0.3)]">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="font-bold text-xs tracking-wider text-white">
                ASTRA CHAT HUD
              </span>
              <span className="text-[9px] font-mono px-2 py-0.5 rounded-full liquid-glass-card text-emerald-300 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                ACTIVE
              </span>
            </div>
            <span className="text-[9px] font-mono text-white/40 tracking-widest uppercase">
              NEURAL CONVERSATION STREAM
            </span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5">
          {/* Clear History */}
          {onClearHistory && (
            <button
              type="button"
              onClick={onClearHistory}
              title="Clear conversation history"
              className="p-1.5 rounded-xl text-white/50 hover:text-rose-300 hover:bg-white/10 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Expand / Minimize Size */}
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            title={isExpanded ? 'Restore window size' : 'Expand window size'}
            className="p-1.5 rounded-xl text-white/50 hover:text-cyan-300 hover:bg-white/10 transition-colors"
          >
            {isExpanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>

          {/* Close HUD */}
          <button
            type="button"
            onClick={onClose}
            title="Minimize Chat HUD"
            className="p-1.5 rounded-xl text-white/50 hover:text-white hover:bg-white/10 transition-colors ml-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 2. Scrollable Messages Container */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto astra-scrollbar p-5 flex flex-col gap-3.5"
      >
        {messages.map((msg) => {
          const isUser = msg.sender === 'user';

          return (
            <div
              key={msg.id}
              className={`flex items-start gap-3 p-4 rounded-2xl transition-all animate-in fade-in slide-in-from-bottom-2 ${
                isUser
                  ? 'liquid-glass-card ml-12 border-white/10 text-white'
                  : 'liquid-glass-pill mr-12 border-cyan-500/25 shadow-[0_0_25px_rgba(0,191,255,0.12)]'
              }`}
            >
              <div
                className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                  isUser
                    ? 'liquid-glass-card text-white/80'
                    : 'bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 shadow-[0_0_15px_rgba(0,191,255,0.5)]'
                }`}
              >
                {isUser ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
              </div>

              <div className="flex flex-col flex-1">
                <div className="flex items-center justify-between">
                  <span
                    className={`text-[10px] font-mono tracking-wider uppercase font-semibold ${
                      isUser ? 'text-white/40' : 'text-cyan-300'
                    }`}
                  >
                    {isUser ? 'YOU' : 'ASTRA AI'}
                  </span>
                  {!isUser && (
                    <button
                      type="button"
                      onClick={() => handleCopy(msg.id, msg.text)}
                      className="text-white/40 hover:text-cyan-300 p-1 rounded-lg transition-colors"
                      title="Copy response"
                    >
                      {copiedId === msg.id ? (
                        <Check className="w-3 h-3 text-emerald-400" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                    </button>
                  )}
                </div>

                <div className="text-xs text-[#E6F7FF] font-sans leading-relaxed mt-1.5 whitespace-pre-wrap selection:bg-cyan-500/30">
                  {msg.text}
                </div>

                {/* Contextual Action Buttons */}
                {msg.actions && msg.actions.length > 0 && (
                  <div className="flex flex-wrap items-center gap-2 mt-3 pt-2.5 border-t border-white/10">
                    {msg.actions.map((act, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={act.onClick}
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                          act.variant === 'primary'
                            ? 'bg-gradient-to-r from-[#00BFFF] to-blue-600 text-white shadow-[0_0_18px_rgba(0,191,255,0.45)] hover:brightness-110 active:scale-95'
                            : 'liquid-glass-chip text-white/80'
                        }`}
                      >
                        <span>{act.label}</span>
                        <ChevronRight className="w-3 h-3" />
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
          <div className="flex items-start gap-3 p-4 rounded-2xl liquid-glass-pill mr-12 border-cyan-500/40 shadow-[0_0_30px_rgba(0,191,255,0.3)] animate-pulse">
            <div className="w-7 h-7 rounded-xl bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 flex items-center justify-center shrink-0 mt-0.5 shadow-[0_0_15px_rgba(0,191,255,0.5)]">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-spin" />
            </div>
            <div className="flex flex-col flex-1">
              <span className="text-[10px] font-mono tracking-wider uppercase font-semibold text-cyan-300">
                ASTRA PROCESSING...
              </span>
              <div className="text-xs text-[#E6F7FF] font-sans leading-relaxed mt-1.5 whitespace-pre-wrap">
                {currentResponse}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 3. Bottom Attached Command Bar & Quick Actions */}
      <div className="p-3 bg-black/40 border-t border-white/[0.08] backdrop-blur-2xl flex flex-col gap-2 select-none">
        <QuickCommands onSelectCommand={onSend} />
        <CommandBar
          onSend={onSend}
          onToggleVoice={onToggleVoice}
          isRecording={isRecording}
          state={state as AstraOrbState}
        />
      </div>
    </div>
  );
};

export default AstraChatBox;
