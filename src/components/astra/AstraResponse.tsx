import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Volume2, Square, Bot } from 'lucide-react';
import type { EvaState } from '../../types/eva';

interface AstraResponseProps {
  state: EvaState;
  responseText: string;
  onStopSpeaking?: () => void;
}

export const AstraResponse: React.FC<AstraResponseProps> = ({
  state,
  responseText,
  onStopSpeaking
}) => {
  if (!responseText && state === 'idle') return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 15, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -10, scale: 0.98 }}
        className="w-full max-w-xl p-5 rounded-3xl bg-slate-950/70 border border-amber-500/30 backdrop-blur-3xl shadow-[0_15px_40px_rgba(0,0,0,0.6)] flex flex-col gap-3 text-slate-100 font-sans"
      >
        {/* Panel Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-amber-500/20 border border-amber-400/40 flex items-center justify-center">
              <Bot className="w-3.5 h-3.5 text-amber-300" />
            </div>
            <span className="font-mono font-bold text-xs tracking-wider text-amber-200 uppercase">
              ASTRA RESPONSE PANEL
            </span>
          </div>

          <div className="flex items-center gap-2">
            {state === 'speaking' && (
              <span className="flex items-center gap-1.5 text-[11px] font-mono text-amber-300 animate-pulse bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/30">
                <Volume2 className="w-3 h-3 animate-bounce" />
                ASTRA IS SPEAKING...
              </span>
            )}
            {state === 'thinking' && (
              <span className="flex items-center gap-1.5 text-[11px] font-mono text-purple-300 animate-pulse bg-purple-500/10 px-2.5 py-0.5 rounded-full border border-purple-500/30">
                <Sparkles className="w-3 h-3 animate-spin" />
                THINKING...
              </span>
            )}
            {state === 'speaking' && onStopSpeaking && (
              <button
                onClick={onStopSpeaking}
                className="p-1 rounded-md hover:bg-rose-500/20 text-rose-300 transition-colors flex items-center gap-1 text-[10px] font-mono border border-rose-500/30 px-2"
                title="Stop Speaking"
              >
                <Square className="w-2.5 h-2.5 fill-current" />
                <span>STOP</span>
              </button>
            )}
          </div>
        </div>

        {/* Live Speech Text Display */}
        <div className="text-sm md:text-base leading-relaxed text-slate-100 font-sans tracking-wide min-h-[48px] max-h-[160px] overflow-y-auto">
          "{responseText || "I'm listening, Boss."}"
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
