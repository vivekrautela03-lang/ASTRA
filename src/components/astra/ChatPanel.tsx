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
      className={`w-full max-w-2xl max-h-[280px] overflow-y-auto astra-scrollbar flex flex-col gap-3 p-4 rounded-3xl bg-[#050f1e]/60 border border-cyan-500/20 backdrop-blur-2xl shadow-[0_15px_40px_rgba(0,0,0,0.7)] select-text ${className}`}
    >
      {/* Historical Messages */}
      {messages.slice(-4).map((msg) => {
        const isUser = msg.sender === 'user';

        return (
          <div
            key={msg.id}
            className={`flex items-start gap-3 p-3.5 rounded-2xl transition-all ${
              isUser
                ? 'bg-white/[0.04] border border-white/10 ml-8'
                : 'bg-cyan-950/20 border border-cyan-500/20 mr-8 shadow-[0_0_15px_rgba(0,191,255,0.1)]'
            }`}
          >
            <div
              className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                isUser
                  ? 'bg-white/10 text-white/80'
                  : 'bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 shadow-[0_0_10px_rgba(0,191,255,0.4)]'
              }`}
            >
              {isUser ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
            </div>

            <div className="flex flex-col flex-1">
              <div className="flex items-center justify-between">
                <span
                  className={`text-[10px] font-mono tracking-wider uppercase font-semibold ${
                    isUser ? 'text-[#6B8299]' : 'text-cyan-400'
                  }`}
                >
                  {isUser ? 'USER' : 'ASTRA'}
                </span>
                {!isUser && (
                  <button
                    type="button"
                    onClick={() => handleCopy(msg.id, msg.text)}
                    className="text-[#6B8299] hover:text-cyan-300 p-1 rounded transition-colors"
                  >
                    {copiedId === msg.id ? (
                      <Check className="w-3 h-3 text-emerald-400" />
                    ) : (
                      <Copy className="w-3 h-3" />
                    )}
                  </button>
                )}
              </div>

              <div className="text-xs text-[#E6F7FF] font-sans leading-relaxed mt-1 whitespace-pre-wrap">
                {msg.text}
              </div>

              {/* Dynamic contextual buttons */}
              {msg.actions && msg.actions.length > 0 && (
                <div className="flex flex-wrap items-center gap-2 mt-3 pt-2 border-t border-cyan-500/10">
                  {msg.actions.map((act, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={act.onClick}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                        act.variant === 'primary'
                          ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-[0_0_15px_rgba(0,191,255,0.4)] hover:brightness-110'
                          : 'bg-white/10 text-white/80 hover:bg-white/15'
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
        <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-cyan-950/30 border border-cyan-500/30 mr-8 shadow-[0_0_20px_rgba(0,191,255,0.2)] animate-pulse">
          <div className="w-6 h-6 rounded-full bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 flex items-center justify-center shrink-0 mt-0.5">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-spin" />
          </div>
          <div className="flex flex-col flex-1">
            <span className="text-[10px] font-mono tracking-wider uppercase font-semibold text-cyan-400">
              ASTRA PROCESSING
            </span>
            <div className="text-xs text-[#E6F7FF] font-sans leading-relaxed mt-1 whitespace-pre-wrap">
              {currentResponse}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatPanel;
