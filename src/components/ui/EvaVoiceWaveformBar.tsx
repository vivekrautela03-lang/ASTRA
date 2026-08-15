import React, { useState, useEffect } from 'react';
import { Send, Mic, Volume2, Sparkles, Globe, Layers, Eye, MessageSquare, Activity } from 'lucide-react';
import type { EvaState } from '../../types/eva';
import { internetSearchService } from '../../services/internetSearchService';

interface EvaVoiceWaveformBarProps {
  state: EvaState;
  onSetEvaState: (newState: EvaState) => void;
  onSendPrompt: (prompt: string) => void;
  lastResponseText: string;
  onToggleVoice: () => void;
  onOpenDashboard: () => void;
  onOpenJarvisScreens: () => void;
  onOpenCameraVision: () => void;
  onOpenChatHistory: () => void;
}

export const EvaVoiceWaveformBar: React.FC<EvaVoiceWaveformBarProps> = ({
  state,
  onSendPrompt,
  lastResponseText,
  onToggleVoice,
  onOpenDashboard,
  onOpenJarvisScreens,
  onOpenCameraVision,
  onOpenChatHistory
}) => {
  const [inputText, setInputText] = useState('');
  const [waveHeights, setWaveHeights] = useState<number[]>(Array(36).fill(10));

  // Apple Siri Multi-Color Liquid Waveform Audio Animation
  useEffect(() => {
    let animFrame: number;
    let tick = 0;

    const updateWave = () => {
      tick += 0.16;
      const newHeights = Array(36).fill(10).map((_, i) => {
        if (state === 'speaking') {
          const sine1 = Math.sin(tick * 3.5 + i * 0.35);
          const sine2 = Math.cos(tick * 5.0 + i * 0.2);
          return Math.max(6, Math.min(44, 18 + (sine1 + sine2) * 12 + Math.random() * 6));
        } else if (state === 'thinking') {
          const sine = Math.sin(tick * 6 + i * 0.4);
          return Math.max(6, 14 + sine * 10);
        } else if (state === 'listening') {
          const sine = Math.sin(tick * 2.5 + i * 0.3);
          return Math.max(6, 12 + sine * 8);
        } else {
          const sine = Math.sin(tick * 1.2 + i * 0.2);
          return Math.max(4, 8 + sine * 3);
        }
      });

      setWaveHeights(newHeights);
      animFrame = requestAnimationFrame(updateWave);
    };

    updateWave();
    return () => cancelAnimationFrame(animFrame);
  }, [state]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    onSendPrompt(inputText.trim());
    setInputText('');
  };

  // Siri Status Pill Text
  const getSiriBadgeText = () => {
    switch (state) {
      case 'listening': return 'Listening to you...';
      case 'thinking': return 'Thinking...';
      case 'speaking': return 'ASTRA Responding...';
      case 'idle':
      default: return 'ASTRA Siri Ready';
    }
  };

  return (
    <div className="relative w-full max-w-2xl mx-auto flex flex-col items-center gap-3 select-none font-sans">
      
      {/* 1. APPLE SIRI FLOATING STATE BADGE */}
      <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/20 dark:bg-slate-900/60 border border-white/30 dark:border-slate-700/50 backdrop-blur-2xl text-slate-800 dark:text-slate-100 text-xs font-medium shadow-[0_8px_32px_rgba(0,0,0,0.12)]">
        <span className={`w-2 h-2 rounded-full ${
          state === 'thinking' ? 'bg-purple-500 animate-ping' :
          state === 'speaking' ? 'bg-cyan-400 animate-pulse' :
          state === 'listening' ? 'bg-rose-500 animate-ping' : 'bg-blue-500 animate-pulse'
        }`} />
        <span className="tracking-wide flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-blue-500 animate-pulse" />
          {getSiriBadgeText()}
        </span>
      </div>

      {/* 2. APPLE iOS 18 SIRI GLASSMORPHISM WAVEFORM FLOATING CONTAINER */}
      <div className="w-full p-4 rounded-[2.5rem] bg-white/30 dark:bg-slate-950/50 border border-white/40 dark:border-slate-800/60 shadow-[0_20px_50px_rgba(0,0,0,0.18)] backdrop-blur-3xl flex flex-col gap-3 transition-all duration-300">
        
        {/* Apple Siri Rainbow Audio Spectrum Visualizer */}
        <div className="w-full h-11 flex items-center justify-center gap-1 px-4 bg-slate-950/20 dark:bg-black/40 rounded-[1.8rem] border border-white/20 dark:border-white/10 overflow-hidden">
          {waveHeights.map((h, idx) => {
            // Siri Liquid Gradient Palette (Blue -> Purple -> Magenta -> Cyan)
            const colors = [
              'from-blue-500 to-cyan-300',
              'from-indigo-500 to-purple-400',
              'from-purple-500 to-rose-400',
              'from-pink-500 to-rose-300',
              'from-cyan-400 to-blue-400'
            ];
            const gradientClass = colors[idx % colors.length];

            return (
              <div
                key={idx}
                className={`w-1 rounded-full bg-gradient-to-t ${gradientClass} transition-all duration-75`}
                style={{
                  height: `${h}px`,
                  boxShadow: state === 'speaking' || state === 'listening' ? '0 0 10px rgba(59,130,246,0.6)' : 'none'
                }}
              />
            );
          })}
        </div>

        {/* Siri Interactive Input Pill */}
        <form onSubmit={handleSubmit} className="flex items-center gap-2">
          <button
            type="button"
            onClick={onToggleVoice}
            className={`p-3.5 rounded-[1.5rem] border transition-all active:scale-95 flex items-center justify-center ${
              state === 'speaking' || state === 'listening'
                ? 'bg-blue-600 text-white border-blue-400 shadow-[0_0_20px_rgba(37,99,235,0.5)] animate-pulse'
                : 'bg-white/40 dark:bg-white/10 border-white/30 dark:border-white/20 text-slate-800 dark:text-slate-100 hover:bg-white/60'
            }`}
            title="Siri Speech Input"
          >
            {state === 'speaking' ? <Volume2 className="w-5 h-5 animate-bounce" /> : <Mic className="w-5 h-5" />}
          </button>

          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={lastResponseText ? lastResponseText : "Ask Siri or type a directive..."}
            className="flex-1 px-5 py-3.5 rounded-[1.5rem] bg-white/50 dark:bg-slate-900/60 border border-white/40 dark:border-slate-700/60 outline-none text-sm text-slate-900 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-400 font-sans tracking-wide focus:border-blue-500 transition-all shadow-inner"
          />

          <button
            type="submit"
            className="p-3.5 rounded-[1.5rem] bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold transition-all active:scale-95 shadow-[0_4px_20px_rgba(37,99,235,0.4)]"
            title="Send Directive"
          >
            <Send className="w-4 h-4 text-white" />
          </button>
        </form>
      </div>

      {/* 3. APPLE iOS FLOATING QUICK CONTROL PILLS */}
      <div className="flex flex-wrap items-center justify-center gap-2 pt-1 font-sans text-xs">
        <button
          onClick={onOpenDashboard}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/30 dark:bg-slate-900/50 border border-white/40 dark:border-slate-800 text-slate-800 dark:text-slate-200 hover:bg-white/50 dark:hover:bg-slate-800 backdrop-blur-xl transition-all shadow-sm"
        >
          <Activity className="w-3.5 h-3.5 text-blue-500" />
          <span className="font-medium">Control Center</span>
        </button>

        <button
          onClick={() => internetSearchService.openWorldMonitor()}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/30 dark:bg-slate-900/50 border border-white/40 dark:border-slate-800 text-slate-800 dark:text-slate-200 hover:bg-white/50 dark:hover:bg-slate-800 backdrop-blur-xl transition-all shadow-sm"
        >
          <Globe className="w-3.5 h-3.5 text-purple-500" />
          <span className="font-medium">World Monitor</span>
        </button>

        <button
          onClick={onOpenJarvisScreens}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/30 dark:bg-slate-900/50 border border-white/40 dark:border-slate-800 text-slate-800 dark:text-slate-200 hover:bg-white/50 dark:hover:bg-slate-800 backdrop-blur-xl transition-all shadow-sm"
        >
          <Layers className="w-3.5 h-3.5 text-cyan-500" />
          <span className="font-medium">HUD Displays</span>
        </button>

        <button
          onClick={onOpenCameraVision}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/30 dark:bg-slate-900/50 border border-white/40 dark:border-slate-800 text-slate-800 dark:text-slate-200 hover:bg-white/50 dark:hover:bg-slate-800 backdrop-blur-xl transition-all shadow-sm"
        >
          <Eye className="w-3.5 h-3.5 text-rose-500" />
          <span className="font-medium">Vision</span>
        </button>

        <button
          onClick={onOpenChatHistory}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/30 dark:bg-slate-900/50 border border-white/40 dark:border-slate-800 text-slate-800 dark:text-slate-200 hover:bg-white/50 dark:hover:bg-slate-800 backdrop-blur-xl transition-all shadow-sm"
        >
          <MessageSquare className="w-3.5 h-3.5 text-indigo-500" />
          <span className="font-medium">Cards</span>
        </button>
      </div>
    </div>
  );
};
