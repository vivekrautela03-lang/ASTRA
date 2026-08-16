import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Sparkles } from 'lucide-react';
import type { EvaState } from '../../types/eva';
import { AstraOrb } from './AstraOrb';
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    onSendPrompt(inputText.trim());
    setInputText('');
  };

  return (
    <div className="relative w-full h-screen font-sans select-none overflow-hidden bg-gradient-to-b from-[#080518] via-[#0d0926] to-[#04020c] text-white flex flex-col justify-between items-center">
      
      {/* 1. SEAMLESS HARDWARE-ACCELERATED BACKGROUND VIDEO & ATMOSPHERIC VIGNETTE */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover z-0 filter brightness-[0.65] contrast-[1.15] saturate-[1.1] opacity-80"
        src="https://res.cloudinary.com/qia3rzqk/video/upload/v1786772058/VID-20260815-WA0003_gowuqn.mp4"
      />

      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,0,0,0.2)_0%,rgba(0,0,0,0.6)_65%,rgba(0,0,0,0.92)_100%)] pointer-events-none z-10" />

      {/* 2. TOP BRANDING HUD HEADER */}
      <header className="relative z-30 w-full px-6 py-4 flex items-center justify-between pointer-events-auto">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500 via-yellow-400 to-amber-600 p-0.5 shadow-lg shadow-amber-500/30">
            <div className="w-full h-full rounded-[10px] bg-[#0d0926] flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
            </div>
          </div>
          <span className="font-light tracking-[0.35em] text-lg font-sans uppercase text-white drop-shadow-[0_2px_15px_rgba(255,255,255,0.4)]">
            ASTRA <span className="text-xs font-mono font-semibold tracking-widest text-amber-200/80">DESKTOP OS</span>
          </span>
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

      {/* 4. MAIN CENTERPIECE: GOLDEN MECHANICAL ASTRA ORB */}
      <main className="relative z-20 flex-1 flex flex-col items-center justify-center p-4">
        <AstraOrb state={state} onOrbClick={onToggleVoice} />

        {/* Live Speech Response Panel */}
        <div className="mt-4">
          <AstraResponse
            state={state}
            responseText={lastResponseText}
            onStopSpeaking={onStopSpeaking}
          />
        </div>
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
