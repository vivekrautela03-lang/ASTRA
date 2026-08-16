import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send } from 'lucide-react';
import type { EvaState } from '../../types/eva';
import { AstraResponse } from './AstraResponse';
import { WeatherWidget } from './AstraWidgets/WeatherWidget';
import { TimeWidget } from './AstraWidgets/TimeWidget';
import { SpecialDayWidget } from './AstraWidgets/SpecialDayWidget';
import { CameraWidget } from './AstraWidgets/CameraWidget';
import { QuickActions } from './AstraWidgets/QuickActions';
import { AstraSettings } from './AstraSettings';

interface AstraDesktopInterfaceProps {
  state: EvaState;
  onSetEvaState: (newState: EvaState) => void;
  onSendPrompt: (prompt: string) => void;
  lastResponseText: string;
  onToggleVoice: () => void;
  onStopSpeaking?: () => void;
  selectedModel: string;
  onSelectModel: (model: string) => void;
}

export const AstraDesktopInterface: React.FC<AstraDesktopInterfaceProps> = ({
  state,
  onSendPrompt,
  lastResponseText,
  onToggleVoice,
  onStopSpeaking,
  selectedModel,
  onSelectModel
}) => {
  const [inputText, setInputText] = useState('');
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [isWeatherVisible, setIsWeatherVisible] = useState(true);
  const [isTimeVisible, setIsTimeVisible] = useState(true);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Dynamic Yellow Glowing Voice Line Path State
  const [wavePoints, setWavePoints] = useState<number[]>(Array(40).fill(0));

  // Dynamic Yellow Glowing Voice Waveform Line Render Loop
  useEffect(() => {
    let animFrame: number;
    let tick = 0;

    const updateWave = () => {
      tick += 0.14;
      const points = Array(40).fill(0).map((_, i) => {
        const distFromCenter = Math.abs(i - 20) / 20;
        const centerFactor = Math.pow(1 - distFromCenter, 2);

        if (state === 'speaking') {
          const s1 = Math.sin(tick * 4 + i * 0.4);
          const s2 = Math.cos(tick * 6 + i * 0.2);
          return (s1 + s2) * 26 * centerFactor;
        } else if (state === 'thinking') {
          const s = Math.sin(tick * 7 + i * 0.5);
          return s * 22 * centerFactor;
        } else if (state === 'listening') {
          const s = Math.sin(tick * 3 + i * 0.3);
          return s * 16 * centerFactor;
        } else {
          const s = Math.sin(tick * 1.5 + i * 0.25);
          return s * 7 * centerFactor;
        }
      });

      setWavePoints(points);
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

  // Generate SVG Path for the Yellow Glowing Voice Line
  const generateSvgPath = () => {
    const width = 450;
    const height = 60;
    const midY = height / 2;
    const step = width / (wavePoints.length - 1);

    let d = `M 0 ${midY}`;
    wavePoints.forEach((yOffset, i) => {
      const x = i * step;
      const y = midY - yOffset;
      d += ` L ${x} ${y}`;
    });

    return d;
  };

  return (
    <div className="relative w-full h-screen font-sans select-none overflow-hidden bg-gradient-to-b from-[#080518] via-[#0d0926] to-[#04020c] text-white flex flex-col justify-between items-center">
      
      {/* 1. SEAMLESS HARDWARE-ACCELERATED BACKGROUND VIDEO WITH RICH AMBIENT GRADIENT */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover z-0 filter brightness-[0.7] contrast-[1.12] saturate-[1.1] opacity-90 transition-opacity duration-700"
        src="https://res.cloudinary.com/qia3rzqk/video/upload/v1786772058/VID-20260815-WA0003_gowuqn.mp4"
      />

      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,0,0,0.15)_0%,rgba(0,0,0,0.55)_65%,rgba(0,0,0,0.90)_100%)] pointer-events-none z-10" />

      {/* 2. TOP BRANDING & YELLOW GLOWING VOICE LINE (MATCHING EXACT USER SCREENSHOT DESIGN) */}
      <header className="relative z-30 w-full flex flex-col items-center pt-8 px-4 pointer-events-auto select-none">
        {/* ASTRA Title */}
        <h1 className="text-4xl md:text-6xl font-light tracking-[0.38em] text-white font-sans uppercase drop-shadow-[0_4px_30px_rgba(255,255,255,0.6)]">
          ASTRA
        </h1>

        {/* AI PERSONAL ASSISTANT Subtitle */}
        <p className="text-[11px] md:text-xs font-semibold tracking-[0.42em] text-amber-200 font-mono uppercase mt-2 drop-shadow-md">
          AI PERSONAL ASSISTANT
        </p>

        {/* Dynamic Yellow Glowing Voice Line Waveform SVG */}
        <div className="w-full max-w-[480px] h-16 flex items-center justify-center mt-2 relative z-30">
          <svg className="w-full h-full overflow-visible" viewBox="0 0 450 60">
            <defs>
              <linearGradient id="yellowGlowGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.2" />
                <stop offset="25%" stopColor="#fbbf24" stopOpacity="0.8" />
                <stop offset="50%" stopColor="#fef08a" stopOpacity="1.0" />
                <stop offset="75%" stopColor="#fbbf24" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.2" />
              </linearGradient>
              <filter id="neonYellowGlow" x="-30%" y="-30%" width="160%" height="160%">
                <feGaussianBlur stdDeviation="3.5" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* Glowing Golden Background Line Shadow */}
            <path
              d={generateSvgPath()}
              fill="none"
              stroke="#f59e0b"
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
              filter="url(#neonYellowGlow)"
              className="opacity-80"
            />

            {/* Bright Yellow Core Neon Line */}
            <path
              d={generateSvgPath()}
              fill="none"
              stroke="url(#yellowGlowGrad)"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </header>

      {/* 3. MODULAR FLOATING GLASS WIDGETS (TOP LEFT & RIGHT) */}
      <div className="absolute top-16 left-6 z-30 pointer-events-auto flex flex-col gap-3">
        {isTimeVisible && (
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <TimeWidget />
          </motion.div>
        )}
      </div>

      <div className="absolute top-16 right-6 z-30 pointer-events-auto flex flex-col gap-3 items-end">
        {isWeatherVisible && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
            <WeatherWidget />
          </motion.div>
        )}
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
          <SpecialDayWidget />
        </motion.div>

        {/* Camera Widget Overlay */}
        <AnimatePresence>
          {isCameraOpen && (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}>
              <CameraWidget isOpen={isCameraOpen} onClose={() => setIsCameraOpen(false)} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 4. MAIN CENTERPIECE: CLEAN SCREEN REVEALING THE BACKGROUND VIDEO WHEEL (3D MODEL REMOVED) */}
      <main className="relative z-20 flex-1 flex flex-col items-center justify-center p-4">
        {/* Live Speech Response Panel */}
        <AstraResponse
          state={state}
          responseText={lastResponseText}
          onStopSpeaking={onStopSpeaking}
        />
      </main>

      {/* 5. BOTTOM DESKTOP FOOTER (QUICK ACTIONS & INPUT FORM) */}
      <footer className="relative z-30 w-full max-w-2xl pb-6 px-4 pointer-events-auto flex flex-col items-center gap-3">
        {/* Quick Action Dock */}
        <QuickActions
          state={state}
          onToggleVoice={onToggleVoice}
          onToggleCamera={() => setIsCameraOpen(!isCameraOpen)}
          onToggleWeather={() => setIsWeatherVisible(!isWeatherVisible)}
          onToggleTime={() => setIsTimeVisible(!isTimeVisible)}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onStopSpeaking={onStopSpeaking}
        />

        {/* Minimal Input Form */}
        <form onSubmit={handleSubmit} className="w-full flex items-center gap-2 p-2 rounded-full bg-slate-950/70 border border-amber-500/30 backdrop-blur-3xl shadow-[0_10px_40px_rgba(0,0,0,0.7)]">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Ask ASTRA anything, Boss..."
            className="flex-1 px-5 py-2.5 bg-transparent border-none outline-none text-sm text-white placeholder:text-amber-100/40 font-sans tracking-wide"
          />

          <button
            type="submit"
            className="p-3.5 rounded-full bg-gradient-to-r from-amber-400 to-yellow-500 text-black font-bold transition-all active:scale-95 shadow-[0_0_20px_rgba(245,158,11,0.7)] flex items-center justify-center"
            title="Send Directive"
          >
            <Send className="w-4 h-4 text-black" />
          </button>
        </form>
      </footer>

      {/* Settings Modal */}
      <AstraSettings
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        selectedModel={selectedModel}
        onSelectModel={onSelectModel}
      />
    </div>
  );
};
