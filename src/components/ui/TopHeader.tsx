import React from 'react';
import { motion } from 'framer-motion';
import { Volume2, VolumeX, Sliders, LayoutDashboard, Monitor, MessageSquare, Camera } from 'lucide-react';
import type { EvaState } from '../../types/eva';

interface TopHeaderProps {
  state: EvaState;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onOpenSettings: () => void;
  onOpenDashboard: () => void;
  onToggleScreens: () => void;
  onOpenChatHistory: () => void;
  onOpenCameraVision: () => void;
  screensOpen: boolean;
}

export const TopHeader: React.FC<TopHeaderProps> = ({
  state,
  soundEnabled,
  onToggleSound,
  onOpenSettings,
  onOpenDashboard,
  onToggleScreens,
  onOpenChatHistory,
  onOpenCameraVision,
  screensOpen
}) => {
  return (
    <header className="fixed top-0 left-0 right-0 z-40 px-6 py-6 md:px-12 flex items-center justify-between pointer-events-auto select-none">
      {/* Top Left: ASTRA Logo Mark & Status */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        onClick={onOpenDashboard}
        className="flex items-center gap-3.5 group cursor-pointer magnetic-target"
      >
        <div className="relative w-9 h-9 rounded-xl glass-panel flex items-center justify-center border border-white/15 group-hover:border-cyan-400/40 transition-colors">
          <div className="w-3.5 h-3.5 rounded-full bg-gradient-to-r from-cyan-400 via-purple-500 to-white animate-pulse shadow-[0_0_12px_rgba(0,240,255,0.8)]" />
          <div className="absolute inset-0 rounded-xl bg-cyan-500/10 blur-sm group-hover:bg-cyan-400/20 transition-all" />
        </div>

        <div className="flex flex-col">
          <span className="text-xl font-extrabold tracking-widest font-heading text-white group-hover:text-cyan-200 transition-colors">
            ASTRA
          </span>
          <span className="text-[10px] uppercase tracking-widest text-white/40 font-mono flex items-center gap-1.5">
            <span className={`w-1.5 h-1.5 rounded-full ${
              state === 'entrance' ? 'bg-purple-400 animate-ping' :
              state === 'thinking' ? 'bg-purple-400 animate-spin' :
              state === 'speaking' ? 'bg-cyan-400 animate-pulse' :
              'bg-emerald-400'
            }`} />
            STARK OS v8.4 • Online
          </span>
        </div>
      </motion.div>

      {/* Top Center: Navigation Action Buttons */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, delay: 0.1 }}
        className="hidden md:flex items-center gap-3"
      >
        <button
          onClick={onOpenDashboard}
          className="flex items-center gap-2 px-4 py-1.5 rounded-full glass-pill text-xs text-white/80 hover:text-white font-mono tracking-wider border border-cyan-500/30 hover:border-cyan-400/60 cursor-pointer transition-all hover:scale-105 active:scale-95 shadow-[0_0_15px_rgba(6,182,212,0.2)]"
        >
          <LayoutDashboard className="w-3.5 h-3.5 text-cyan-400" />
          <span>COMMAND CENTER</span>
        </button>

        <button
          onClick={onOpenCameraVision}
          className="flex items-center gap-2 px-4 py-1.5 rounded-full glass-pill text-xs text-white/80 hover:text-white font-mono tracking-wider border border-emerald-500/30 hover:border-emerald-400/60 cursor-pointer transition-all hover:scale-105 active:scale-95 shadow-[0_0_15px_rgba(16,185,129,0.2)]"
        >
          <Camera className="w-3.5 h-3.5 text-emerald-400" />
          <span>CAMERA VISION</span>
        </button>

        <button
          onClick={onOpenChatHistory}
          className="flex items-center gap-2 px-4 py-1.5 rounded-full glass-pill text-xs text-white/80 hover:text-white font-mono tracking-wider border border-purple-500/30 hover:border-purple-400/60 cursor-pointer transition-all hover:scale-105 active:scale-95 shadow-[0_0_15px_rgba(168,85,247,0.2)]"
        >
          <MessageSquare className="w-3.5 h-3.5 text-purple-400" />
          <span>CHAT CARDS</span>
        </button>

        <button
          onClick={onToggleScreens}
          className={`flex items-center gap-2 px-4 py-1.5 rounded-full glass-pill text-xs font-mono tracking-wider transition-all hover:scale-105 active:scale-95 ${
            screensOpen 
              ? 'bg-cyan-500/30 text-cyan-300 border border-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.4)]' 
              : 'text-white/80 border border-white/10 hover:border-cyan-400/40'
          }`}
        >
          <Monitor className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
          <span>{screensOpen ? 'CLOSE HUD SCREENS' : 'OPEN HUD SCREENS'}</span>
        </button>
      </motion.div>

      {/* Top Right: Sound Toggle & Settings */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="flex items-center gap-3.5"
      >
        {/* Sound Toggle */}
        <button
          onClick={onToggleSound}
          className="w-10 h-10 rounded-full glass-pill flex items-center justify-center text-white/70 hover:text-white transition-all hover:scale-105 active:scale-95 magnetic-target"
          title={soundEnabled ? 'Mute Spatial Audio' : 'Unmute Spatial Audio'}
        >
          {soundEnabled ? <Volume2 className="w-4.5 h-4.5 text-cyan-400" /> : <VolumeX className="w-4.5 h-4.5 text-white/40" />}
        </button>

        {/* Settings button */}
        <button
          onClick={onOpenSettings}
          className="w-10 h-10 rounded-full glass-pill flex items-center justify-center text-white/70 hover:text-white transition-all hover:scale-105 active:scale-95 magnetic-target"
          title="System Preferences"
        >
          <Sliders className="w-4.5 h-4.5" />
        </button>
      </motion.div>
    </header>
  );
};
