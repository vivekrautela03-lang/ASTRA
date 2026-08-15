import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, ArrowUp, BrainCircuit, Radio, Volume2, Music, Play } from 'lucide-react';
import { automationBridge } from '../../services/automationBridge';
import type { EvaState } from '../../types/eva';

interface VoiceInteractionBarProps {
  state: EvaState;
  audioLevel: number;
  onSend: (prompt: string) => void;
  onToggleVoice: () => void;
  onStateChange: (state: EvaState) => void;
}

export const VoiceInteractionBar: React.FC<VoiceInteractionBarProps> = ({
  state,
  audioLevel,
  onSend,
  onToggleVoice,
  onStateChange,
}) => {
  const [input, setInput] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const [musicOpen, setMusicOpen] = useState(false);
  const [musicQuery, setMusicQuery] = useState('');
  const [musicResults, setMusicResults] = useState<Array<{ id: string; title: string; url: string }>>([]);
  const [musicLoading, setMusicLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    onSend(input.trim());
    setInput('');
  };

  return (
    <div className="fixed bottom-6 left-0 right-0 z-40 px-4 md:px-8 max-w-2xl mx-auto pointer-events-auto">
      {/* State Switcher Tabs (Idle, Thinking, Speaking) */}
      <div className="flex justify-center mb-3">
        <div className="glass-panel p-1 rounded-full flex items-center gap-1 border border-white/10">
          {(
            [
              { id: 'idle', label: 'Idle', icon: Radio },
              { id: 'thinking', label: 'Thinking', icon: BrainCircuit },
              { id: 'speaking', label: 'Speaking', icon: Volume2 },
            ] as const
          ).map((item) => {
            const Icon = item.icon;
            const isActive = state === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onStateChange(item.id)}
                className={`relative px-3 py-1 rounded-full text-[11px] font-mono transition-all flex items-center gap-1.5 ${
                  isActive ? 'text-white font-semibold' : 'text-white/40 hover:text-white/80'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeStatePill"
                    className="absolute inset-0 rounded-full bg-cyan-500/25 border border-cyan-400/40 backdrop-blur-md shadow-[0_0_12px_rgba(0,240,255,0.4)]"
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
                <Icon className={`w-3 h-3 relative z-10 ${isActive ? 'text-cyan-300' : ''}`} />
                <span className="relative z-10 capitalize">{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Glass Input Bar */}
      <form
        onSubmit={handleSubmit}
        className={`relative rounded-full transition-all duration-500 ${
          isFocused || state === 'speaking' ? 'glass-panel-glow ring-1 ring-cyan-400/50' : 'glass-panel'
        }`}
      >
        <div className="relative flex items-center px-4 py-3 gap-3">
          {/* Left: Voice Mic Button */}
          <button
            type="button"
            onClick={onToggleVoice}
            className={`relative w-11 h-11 rounded-full flex items-center justify-center transition-all duration-300 ${
              state === 'speaking'
                ? 'bg-cyan-400 text-black shadow-[0_0_25px_rgba(0,240,255,0.8)] scale-105'
                : 'bg-white/5 text-white/80 hover:text-white hover:bg-white/15'
            } magnetic-target`}
            title={state === 'speaking' ? 'Stop listening' : 'Start real-time voice'}
          >
            <Mic className="w-5 h-5" />
            {state === 'speaking' && (
              <span
                className="absolute inset-0 rounded-full border border-cyan-400/60 animate-ping pointer-events-none"
                style={{ animationDuration: '1.5s' }}
              />
            )}
          </button>

          {/* Center Input Field */}
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder={state === 'speaking' ? 'EVA is listening in real time...' : 'Ask EVA anything...'}
            className="flex-1 bg-transparent border-none outline-none text-white text-base md:text-lg placeholder-white/35 font-light tracking-wide font-sans"
          />

          {/* Right Action: Real-Time Waveform & Send Button */}
          <div className="flex items-center gap-2">
            {/* Music Toggle Button */}
            <button
              type="button"
              onClick={() => setMusicOpen((s) => !s)}
              className="w-9 h-9 rounded-full flex items-center justify-center text-white/80 bg-white/5 hover:bg-white/10"
              title="Music"
            >
              <Music className="w-4 h-4" />
            </button>

            <AnimatePresence>
              {(state === 'speaking' || state === 'thinking') && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-cyan-950/50 border border-cyan-500/30"
                >
                  {[0.4, 0.9, 0.6, 1.0, 0.5].map((h, i) => (
                    <motion.div
                      key={i}
                      animate={{
                        height: [4, 16 * h * (1 + audioLevel * 1.5), 4],
                      }}
                      transition={{
                        repeat: Infinity,
                        duration: 0.5 + i * 0.1,
                        ease: 'easeInOut',
                      }}
                      className="w-1 rounded-full bg-cyan-400"
                    />
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

            <button
              type="submit"
              disabled={!input.trim()}
              className={`w-11 h-11 rounded-full flex items-center justify-center transition-all duration-300 ${
                input.trim()
                  ? 'bg-gradient-to-tr from-cyan-400 to-purple-600 text-white shadow-[0_0_20px_rgba(0,240,255,0.5)] scale-105 hover:scale-110 active:scale-95'
                  : 'bg-white/5 text-white/20 cursor-not-allowed'
              } magnetic-target`}
            >
              <ArrowUp className="w-5 h-5 stroke-[2.5]" />
            </button>
          </div>
        </div>
      </form>

      {/* Music Panel */}
      <AnimatePresence>
        {musicOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            className="mt-3 glass-panel p-3 rounded-xl max-w-2xl mx-auto"
          >
            <div className="flex gap-2">
              <input
                value={musicQuery}
                onChange={(e) => setMusicQuery(e.target.value)}
                placeholder="Search songs or artists..."
                className="flex-1 bg-transparent border-none outline-none text-white placeholder-white/40 px-2 py-1"
              />
              <button
                onClick={async () => {
                  if (!musicQuery.trim()) return;
                  setMusicLoading(true);
                  try {
                    const res = await automationBridge.searchSong(musicQuery.trim(), 'youtube');
                    setMusicResults(res.results || []);
                  } catch (e) {
                    console.error(e);
                  } finally {
                    setMusicLoading(false);
                  }
                }}
                className="px-3 py-1 rounded bg-cyan-500 text-black font-semibold"
              >
                {musicLoading ? 'Searching...' : 'Search'}
              </button>
            </div>

            <div className="mt-3 max-h-48 overflow-y-auto">
              {musicResults.length === 0 && <div className="text-sm text-white/50">No results</div>}
              {musicResults.map((r, i) => (
                <div key={r.id} className="flex items-center justify-between py-2 border-b border-white/5">
                  <div className="text-sm">{r.title}</div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={async () => {
                        try {
                          await automationBridge.playSong({ index: i });
                        } catch (e) {
                          console.error(e);
                        }
                      }}
                      className="w-9 h-9 rounded-full flex items-center justify-center bg-white/5 hover:bg-white/10"
                      title="Play"
                    >
                      <Play className="w-4 h-4" />
                    </button>
                    <a href={r.url} target="_blank" rel="noreferrer" className="text-white/40 text-xs">
                      Open
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
