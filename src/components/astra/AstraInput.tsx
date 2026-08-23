import React, { useRef, useEffect } from 'react';
import { ArrowUp, X } from 'lucide-react';
import { AstraVoiceButton } from './AstraVoiceButton';

export interface AstraInputProps {
  value: string;
  onChange: (val: string) => void;
  onSubmit: (val: string) => void;
  isListening: boolean;
  onToggleVoice: () => void;
  permissionError?: string | null;
  placeholder?: string;
  disabled?: boolean;
}

export const AstraInput: React.FC<AstraInputProps> = ({
  value,
  onChange,
  onSubmit,
  isListening,
  onToggleVoice,
  permissionError,
  placeholder = 'Ask Astra anything...',
  disabled = false
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = () => {
    if (!value.trim() || disabled) return;
    onSubmit(value.trim());
    onChange('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value);
    // Auto adjust height up to 100px
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 100)}px`;
    }
  };

  useEffect(() => {
    // Focus on mount
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  }, []);

  return (
    <div className="w-full px-4 pb-4 pt-2">
      <div className="relative flex items-end gap-2 p-2 rounded-2xl bg-black/40 border border-white/10 focus-within:border-purple-500/50 focus-within:ring-1 focus-within:ring-purple-500/30 transition-all shadow-inner">
        {/* Text Area */}
        <textarea
          ref={textareaRef}
          value={value}
          onChange={handleTextChange}
          onKeyDown={handleKeyDown}
          placeholder={isListening ? 'Listening to voice...' : placeholder}
          rows={1}
          disabled={disabled}
          className="w-full pl-2 pr-1 py-1.5 bg-transparent text-xs md:text-sm text-white placeholder-white/40 resize-none focus:outline-none astra-scrollbar max-h-[100px]"
          aria-label="Ask Astra"
        />

        {/* Clear Button */}
        {value.trim() && (
          <button
            type="button"
            onClick={() => {
              onChange('');
              if (textareaRef.current) textareaRef.current.style.height = 'auto';
            }}
            className="p-1.5 rounded-lg text-white/40 hover:text-white transition-colors"
            title="Clear text"
            aria-label="Clear text"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}

        {/* Voice Microphone Toggle */}
        <AstraVoiceButton
          isListening={isListening}
          onToggle={onToggleVoice}
          permissionError={permissionError}
        />

        {/* Submit Button */}
        <button
          type="button"
          onClick={handleSubmit}
          disabled={!value.trim() || disabled}
          className={`p-2 rounded-xl transition-all duration-300 flex items-center justify-center ${
            value.trim() && !disabled
              ? 'bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white shadow-[0_0_15px_rgba(139,92,246,0.5)] hover:scale-105 active:scale-95'
              : 'bg-white/5 text-white/20 cursor-not-allowed'
          }`}
          title="Send directive (Enter)"
          aria-label="Send message"
        >
          <ArrowUp className="w-4 h-4" />
        </button>
      </div>

      {permissionError && (
        <p className="text-[10px] text-rose-400 text-center mt-1.5 font-sans">
          {permissionError}
        </p>
      )}
    </div>
  );
};
