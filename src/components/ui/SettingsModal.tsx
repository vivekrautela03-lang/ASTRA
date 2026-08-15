import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sliders, Cpu, Volume2, ShieldCheck, Sparkles } from 'lucide-react';
import type { SystemSettings } from '../../types/eva';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: SystemSettings;
  onUpdateSettings: (newSettings: Partial<SystemSettings>) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-auto select-none">
          {/* Backdrop Blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-xl"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full max-w-lg glass-panel-glow rounded-3xl p-6 md:p-8 overflow-hidden z-10 border border-white/15"
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-6 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl glass-panel flex items-center justify-center text-cyan-400">
                  <Sliders className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white font-heading">EVA OS Preferences</h2>
                  <p className="text-xs text-white/40">GPU particle shaders & neural parameters</p>
                </div>
              </div>

              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full glass-pill flex items-center justify-center text-white/60 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Options List */}
            <div className="py-6 space-y-6">
              {/* GPU Performance Mode */}
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-wider text-white/50 font-semibold flex items-center gap-2 font-mono">
                  <Cpu className="w-3.5 h-3.5 text-cyan-400" />
                  GPU Particle Shaders
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['high', 'balanced', 'power-save'] as const).map((mode) => (
                    <button
                      key={mode}
                      onClick={() => onUpdateSettings({ gpuMode: mode })}
                      className={`px-3 py-2 rounded-xl text-xs capitalize transition-all border ${
                        settings.gpuMode === mode
                          ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 font-medium'
                          : 'glass-pill text-white/60 border-white/10 hover:text-white'
                      }`}
                    >
                      {mode}
                    </button>
                  ))}
                </div>
              </div>

              {/* Neural Voice Engine */}
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-wider text-white/50 font-semibold flex items-center gap-2 font-mono">
                  <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                  Neural Voice Engine
                </label>
                <select
                  value={settings.voiceModel}
                  onChange={(e) => onUpdateSettings({ voiceModel: e.target.value })}
                  className="w-full bg-[#081020] border border-white/15 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-400 font-mono"
                >
                  <option value="eva-quantum-v8">EVA Quantum Neural v8 (Ultra Natural)</option>
                  <option value="apple-neural">Apple Intelligence Spatial Core</option>
                  <option value="whisper-v3">Whisper V3 Real-Time</option>
                </select>
              </div>

              {/* Toggles */}
              <div className="space-y-4 pt-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Volume2 className="w-4 h-4 text-white/60" />
                    <div>
                      <span className="text-sm font-medium text-white block">Spatial Audio Feedback</span>
                      <span className="text-xs text-white/40 block">Play ambient sonic cues during core state transitions</span>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.soundEnabled}
                    onChange={(e) => onUpdateSettings({ soundEnabled: e.target.checked })}
                    className="w-5 h-5 accent-cyan-400 cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <div>
                      <span className="text-sm font-medium text-white block">Local Privacy Isolation</span>
                      <span className="text-xs text-white/40 block">Process voice & memory strictly on local GPU hardware</span>
                    </div>
                  </div>
                  <span className="text-xs text-emerald-400 font-mono bg-emerald-950/60 px-2.5 py-1 rounded-full border border-emerald-500/30">
                    Active
                  </span>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="pt-4 border-t border-white/10 flex justify-end">
              <button
                onClick={onClose}
                className="px-6 py-2.5 rounded-full bg-gradient-to-r from-cyan-400 to-purple-500 text-black font-semibold text-sm hover:shadow-[0_0_20px_rgba(0,240,255,0.4)] transition-all"
              >
                Save Preferences
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
