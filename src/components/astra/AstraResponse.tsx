import React from 'react';
import { Bot, User, ChevronRight, Square } from 'lucide-react';
import type { EvaState } from '../../types/eva';
import type { ActionButton } from './useAstraAssistant';

export interface AstraResponseProps {
  userQuery?: string | null;
  response?: string | null;
  responseText?: string;
  state?: EvaState;
  onStopSpeaking?: () => void;
  actionButtons?: ActionButton[];
  className?: string;
}

export const AstraResponse: React.FC<AstraResponseProps> = ({
  userQuery,
  response,
  responseText,
  state,
  onStopSpeaking,
  actionButtons = [],
  className = ''
}) => {
  const displayResponse = response || responseText;

  if (!userQuery && !displayResponse) return null;

  return (
    <div className={`w-full flex flex-col gap-3 px-4 py-2 astra-scrollbar overflow-y-auto max-h-[220px] ${className}`}>
      {/* 1. User Query Preview */}
      {userQuery && (
        <div className="flex items-start gap-2.5 p-2.5 rounded-2xl bg-white/[0.04] border border-white/5 backdrop-blur-md">
          <div className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center shrink-0 mt-0.5">
            <User className="w-3 h-3 text-white/70" />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-mono text-white/40 uppercase tracking-wider">
              YOU
            </span>
            <p className="text-xs text-white/90 leading-relaxed font-sans mt-0.5">
              "{userQuery}"
            </p>
          </div>
        </div>
      )}

      {/* 2. Astra Neural Response */}
      {displayResponse && (
        <div className="flex items-start gap-2.5 p-3 rounded-2xl astra-glass-card">
          <div className="w-5 h-5 rounded-full bg-purple-600/30 border border-purple-500/40 flex items-center justify-center shrink-0 mt-0.5">
            <Bot className="w-3 h-3 text-purple-300" />
          </div>
          <div className="flex flex-col w-full">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono text-purple-400 uppercase tracking-wider">
                ASTRA
              </span>
              {state === 'speaking' && onStopSpeaking && (
                <button
                  type="button"
                  onClick={onStopSpeaking}
                  className="flex items-center gap-1 text-[10px] text-amber-300/80 hover:text-amber-200 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20 transition-colors"
                >
                  <Square className="w-2.5 h-2.5 fill-current" />
                  <span>Stop</span>
                </button>
              )}
            </div>

            <div className="text-xs text-white/90 leading-relaxed font-sans mt-1 whitespace-pre-wrap">
              {displayResponse}
            </div>

            {/* Action Buttons */}
            {actionButtons.length > 0 && (
              <div className="flex flex-wrap items-center gap-2 mt-3 pt-2 border-t border-white/5">
                {actionButtons.map((btn, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={btn.action}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                      btn.variant === 'primary'
                        ? 'bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white shadow-[0_0_12px_rgba(139,92,246,0.4)] hover:brightness-110 active:scale-95'
                        : 'bg-white/10 text-white/80 hover:bg-white/15 hover:text-white active:scale-95'
                    }`}
                  >
                    <span>{btn.label}</span>
                    <ChevronRight className="w-3 h-3" />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
