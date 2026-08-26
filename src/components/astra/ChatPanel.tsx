import React from 'react';
import { Bot, User, Sparkles, ChevronRight, Copy, Check } from 'lucide-react';

export interface ChatMessage {
  id: string;
  sender: 'user' | 'astra';
  text: string;
  timestamp?: string;
  actions?: Array<{
    label: string;
    variant?: 'primary' | 'secondary';
    onClick: () => void;
  }>;
}

interface ChatPanelProps {
  messages: ChatMessage[];
  currentResponse?: string | null;
  className?: string;
}

export const ChatPanel: React.FC<ChatPanelProps> = ({
  messages,
  currentResponse,
  className = ''
}) => {
  const [copiedId, setCopiedId] = React.useState<string | null>(null);

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (messages.length === 0 && !currentResponse) return null;

  return (
    <div
      className={`w-full max-w-2xl max-h-[290px] overflow-y-auto astra-scrollbar flex flex-col gap-3 p-4 rounded-3xl liquid-glass select-text ${className}`}
    >
      {/* Historical Messages */}
      {messages.slice(-4).map((msg) => {
        const isUser = msg.sender === 'user';

        return (
          <div
            key={msg.id}
            className={`flex items-start gap-3 p-4 rounded-2xl transition-all ${
              isUser
                ? 'liquid-glass-card ml-8 border-white/10'
                : 'liquid-glass-pill mr-8 border-cyan-500/25 shadow-[0_0_25px_rgba(0,191,255,0.15)]'
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
                  {isUser ? 'USER' : 'ASTRA'}
                </span>
                {!isUser && (
                  <button
                    type="button"
                    onClick={() => handleCopy(msg.id, msg.text)}
                    className="text-white/40 hover:text-cyan-300 p-1 rounded-lg transition-colors"
                  >
                    {copiedId === msg.id ? (
                      <Check className="w-3 h-3 text-emerald-400" />
                    ) : (
                      <Copy className="w-3 h-3" />
                    )}
                  </button>
                )}
              </div>

              <div className="text-xs text-[#E6F7FF] font-sans leading-relaxed mt-1.5 whitespace-pre-wrap">
                {msg.text}
              </div>

              {/* Dynamic contextual buttons */}
              {msg.actions && msg.actions.length > 0 && (
                <div className="flex flex-wrap items-center gap-2 mt-3.5 pt-2.5 border-t border-white/10">
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

      {/* Streaming Live Response */}
      {currentResponse && (
        <div className="flex items-start gap-3 p-4 rounded-2xl liquid-glass-pill mr-8 border-cyan-500/40 shadow-[0_0_30px_rgba(0,191,255,0.3)] animate-pulse">
          <div className="w-7 h-7 rounded-xl bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 flex items-center justify-center shrink-0 mt-0.5 shadow-[0_0_15px_rgba(0,191,255,0.5)]">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-spin" />
          </div>
          <div className="flex flex-col flex-1">
            <span className="text-[10px] font-mono tracking-wider uppercase font-semibold text-cyan-300">
              ASTRA PROCESSING
            </span>
            <div className="text-xs text-[#E6F7FF] font-sans leading-relaxed mt-1.5 whitespace-pre-wrap">
              {currentResponse}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatPanel;
