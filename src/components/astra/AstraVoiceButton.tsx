import React from 'react';
import { Mic, MicOff } from 'lucide-react';

export interface AstraVoiceButtonProps {
  isListening: boolean;
  onToggle: () => void;
  permissionError?: string | null;
  className?: string;
}

export const AstraVoiceButton: React.FC<AstraVoiceButtonProps> = ({
  isListening,
  onToggle,
  permissionError,
  className = ''
}) => {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={`relative p-2 rounded-xl transition-all duration-300 flex items-center justify-center ${
        isListening
          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-[0_0_15px_rgba(244,63,94,0.4)] animate-pulse'
          : 'text-white/60 hover:text-white hover:bg-white/10'
      } ${className}`}
      title={
        permissionError
          ? permissionError
          : isListening
          ? 'Stop listening'
          : 'Start voice input'
      }
      aria-label={isListening ? 'Stop listening' : 'Start voice input'}
      aria-pressed={isListening}
    >
      {isListening ? (
        <div className="flex items-center gap-1.5 px-0.5">
          <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
          <Mic className="w-4 h-4 text-rose-400" />
        </div>
      ) : permissionError ? (
        <MicOff className="w-4 h-4 text-rose-400" />
      ) : (
        <Mic className="w-4 h-4" />
      )}
    </button>
  );
};
