import React, { useState, useRef } from 'react';
import { Mic, Send, Sparkles, Square } from 'lucide-react';
import type { AstraOrbState } from './AstraOrb';

interface CommandBarProps {
  onSend: (text: string) => void;
  onToggleVoice: () => void;
  isRecording: boolean;
  state: AstraOrbState;
  disabled?: boolean;
  className?: string;
}

export const CommandBar: React.FC<CommandBarProps> = ({
  onSend,
  onToggleVoice,
  isRecording,
  state,
  disabled = false,
  className = ''
}) => {
  const [input, setInput] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (input.trim() && !disabled) {
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

  const isListening = isRecording || String(state).toUpperCase().includes('LISTEN');

  return (
    <div className={`w-full max-w-3xl flex flex-col items-center gap-2 select-none ${className}`}>
      <form
        onSubmit={handleSubmit}
        className={`w-full relative flex items-center gap-3.5 px-6 py-4 rounded-3xl liquid-glass-input transition-all duration-300 ${
          isListening
            ? 'border-2 border-[#00BFFF] shadow-[0_0_35px_rgba(0,191,255,0.5)] ring-2 ring-cyan-500/30'
            : ''
        }`}
      >
        {/* Left Indicator */}
        <div className="flex items-center justify-center shrink-0">
          {isListening ? (
            <div className="flex items-center gap-1">
              <span className="w-1.5 h-4 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-1.5 h-6 bg-cyan-300 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-1.5 h-3 bg-cyan-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          ) : (
            <Sparkles className="w-4 h-4 text-cyan-400/80" />
          )}
        </div>

        {/* Text Input Area */}
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            e.target.style.height = 'auto';
            e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`;
          }}
          onKeyDown={handleKeyDown}
          rows={1}
          placeholder={isListening ? 'Listening to your voice...' : 'Ask ASTRA anything... (Shift+Enter for newline)'}
          disabled={disabled}
          className="flex-1 bg-transparent text-sm text-[#E6F7FF] placeholder-white/40 resize-none outline-none font-sans leading-relaxed max-h-28"
        />

        {/* Right Controls */}
        <div className="flex items-center gap-2.5 shrink-0">
          {/* Prominent Voice Mode Toggle */}
          <button
            type="button"
            onClick={onToggleVoice}
            title={isListening ? 'Stop listening' : 'Start voice mode'}
            className={`p-3 rounded-2xl transition-all flex items-center justify-center ${
              isListening
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/50 shadow-[0_0_20px_rgba(244,63,94,0.5)] animate-pulse'
                : 'liquid-glass-pill text-cyan-300 hover:scale-105 active:scale-95'
            }`}
          >
            {isListening ? <Square className="w-4 h-4 fill-current" /> : <Mic className="w-4 h-4" />}
          </button>

          {/* Send Action */}
          <button
            type="submit"
            disabled={!input.trim() || disabled}
            title="Send directive (Enter)"
            className={`p-3 rounded-2xl transition-all flex items-center justify-center ${
              input.trim() && !disabled
                ? 'bg-gradient-to-r from-[#00BFFF] to-blue-600 text-white shadow-[0_0_20px_rgba(0,191,255,0.55)] hover:brightness-110 active:scale-95'
                : 'bg-white/[0.04] text-white/30 cursor-not-allowed border border-white/[0.06]'
            }`}
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
};

export default CommandBar;
