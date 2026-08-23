import React from 'react';
import { Sparkles, Minus, X, MoreVertical } from 'lucide-react';

export interface AstraHeaderProps {
  onMinimize: () => void;
  onClose: () => void;
  onOpenSettings?: () => void;
}

export const AstraHeader: React.FC<AstraHeaderProps> = ({
  onMinimize,
  onClose,
  onOpenSettings
}) => {
  return (
    <div className="w-full flex items-center justify-between px-4 py-3 border-b border-white/10 select-none cursor-grab active:cursor-grabbing bg-white/[0.02]">
      {/* Brand Identity */}
      <div className="flex items-center gap-2.5">
        <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-purple-600 to-fuchsia-500 flex items-center justify-center shadow-[0_0_12px_rgba(139,92,246,0.5)]">
          <Sparkles className="w-3.5 h-3.5 text-white" />
        </div>
        <div className="flex items-baseline gap-1.5">
          <span className="font-bold text-xs tracking-widest text-white uppercase bg-gradient-to-r from-white via-white/90 to-white/70 bg-clip-text">
            ASTRA
          </span>
          <span className="text-[9px] font-mono text-purple-400/80 uppercase tracking-wider">
            OS
          </span>
        </div>
      </div>

      {/* Action Controls */}
      <div className="flex items-center gap-1">
        {onOpenSettings && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onOpenSettings();
            }}
            className="p-1.5 rounded-lg text-white/50 hover:text-white hover:bg-white/10 transition-colors"
            title="Settings"
            aria-label="Settings"
          >
            <MoreVertical className="w-3.5 h-3.5" />
          </button>
        )}

        <button
          onClick={(e) => {
            e.stopPropagation();
            onMinimize();
          }}
          className="p-1.5 rounded-lg text-white/50 hover:text-white hover:bg-white/10 transition-colors"
          title="Minimize to Floating Orb (Ctrl+Space)"
          aria-label="Minimize"
        >
          <Minus className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          className="p-1.5 rounded-lg text-white/50 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
          title="Close"
          aria-label="Close"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
