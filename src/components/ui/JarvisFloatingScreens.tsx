import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Activity, Terminal, Eye, Cpu, 
  X, Maximize2, Minimize2, Sparkles, 
  Command, Code2
} from 'lucide-react';
import type { SystemTelemetryData, AIAgent, VisionDetection, OSAction } from '../../types/eva';

interface JarvisFloatingScreensProps {
  isOpen: boolean;
  onClose: () => void;
  telemetry: SystemTelemetryData;
  agents: AIAgent[];
  visionDetections: VisionDetection[];
  osActions: OSAction[];
  onExecuteCommand: (cmd: string) => void;
}

export const JarvisFloatingScreens: React.FC<JarvisFloatingScreensProps> = ({
  isOpen,
  onClose,
  telemetry,
  agents,
  visionDetections,
  osActions,
  onExecuteCommand
}) => {
  const [minimizedScreens, setMinimizedScreens] = useState<Record<string, boolean>>({});

  const toggleMinimize = (id: string) => {
    setMinimizedScreens(prev => ({ ...prev, [id]: !prev[id] }));
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-40 pointer-events-none overflow-hidden select-none">
        {/* Background Scanline & Grid Effect */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,240,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,240,255,0.03)_1px,transparent_1px)] [background-size:40px_40px] opacity-40 pointer-events-none" />

        {/* Top Control Bar */}
        <div className="absolute top-20 left-1/2 -translate-x-1/2 pointer-events-auto flex items-center gap-3 px-4 py-2 rounded-full glass-card border border-cyan-400/40 bg-cyan-950/80 backdrop-blur-xl shadow-[0_0_25px_rgba(6,182,212,0.3)] text-xs font-mono">
          <Sparkles className="w-4 h-4 text-cyan-400 animate-pulse" />
          <span className="text-cyan-300 font-bold tracking-widest">JARVIS HOLOGRAPHIC DISPLAY ARRAY</span>
          <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-400 border border-cyan-400/30">
            4 HUD SCREENS ACTIVE
          </span>
          <button
            onClick={onClose}
            className="p-1 rounded-lg bg-white/5 hover:bg-red-500/20 text-white/60 hover:text-red-400 transition-colors ml-2"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* SCREEN 1: TOP LEFT — SYSTEM TELEMETRY HUD */}
        <motion.div
          initial={{ opacity: 0, x: -100, scale: 0.9 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: -100, scale: 0.9 }}
          transition={{ duration: 0.4 }}
          className="absolute top-28 left-6 w-80 pointer-events-auto glass-card bg-[#020617]/85 border border-cyan-500/30 rounded-2xl p-4 shadow-2xl backdrop-blur-xl font-mono text-white"
        >
          <div className="flex items-center justify-between border-b border-cyan-500/20 pb-2 mb-3">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-cyan-400" />
              <span className="text-xs font-bold text-cyan-300 tracking-wider">HUD :: TELEMETRY</span>
            </div>
            <div className="flex items-center gap-1">
              <button onClick={() => toggleMinimize('telemetry')} className="p-1 hover:text-cyan-400 text-white/60">
                {minimizedScreens['telemetry'] ? <Maximize2 className="w-3 h-3" /> : <Minimize2 className="w-3 h-3" />}
              </button>
            </div>
          </div>

          {!minimizedScreens['telemetry'] && (
            <div className="space-y-3 text-xs">
              <div>
                <div className="flex justify-between text-[11px] mb-1">
                  <span className="text-white/60">CPU Core Load:</span>
                  <span className="text-cyan-400 font-bold">{telemetry.cpuUsage}%</span>
                </div>
                <div className="w-full bg-white/10 h-1 rounded-full overflow-hidden">
                  <div className="bg-cyan-400 h-full transition-all duration-500" style={{ width: `${telemetry.cpuUsage}%` }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[11px] mb-1">
                  <span className="text-white/60">GPU VRAM Load:</span>
                  <span className="text-emerald-400 font-bold">{telemetry.gpuUsage}% ({telemetry.vramUsedGB} GB)</span>
                </div>
                <div className="w-full bg-white/10 h-1 rounded-full overflow-hidden">
                  <div className="bg-emerald-400 h-full transition-all duration-500" style={{ width: `${telemetry.gpuUsage}%` }} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1 border-t border-white/10 text-[10px]">
                <div className="p-2 rounded bg-white/5 border border-white/10">
                  <span className="text-white/50">Temp:</span> <span className="text-amber-400 font-bold">{telemetry.gpuTemp}°C</span>
                </div>
                <div className="p-2 rounded bg-white/5 border border-white/10">
                  <span className="text-white/50">FPS:</span> <span className="text-purple-400 font-bold">{telemetry.fps}</span>
                </div>
              </div>
            </div>
          )}
        </motion.div>

        {/* SCREEN 2: BOTTOM LEFT — AUTONOMOUS AGENTS HUD */}
        <motion.div
          initial={{ opacity: 0, x: -100, scale: 0.9 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: -100, scale: 0.9 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="absolute bottom-24 left-6 w-80 pointer-events-auto glass-card bg-[#020617]/85 border border-cyan-500/30 rounded-2xl p-4 shadow-2xl backdrop-blur-xl font-mono text-white"
        >
          <div className="flex items-center justify-between border-b border-cyan-500/20 pb-2 mb-3">
            <div className="flex items-center gap-2">
              <Cpu className="w-4 h-4 text-purple-400" />
              <span className="text-xs font-bold text-purple-300 tracking-wider">HUD :: SUBAGENTS</span>
            </div>
            <button onClick={() => toggleMinimize('agents')} className="p-1 hover:text-purple-400 text-white/60">
              {minimizedScreens['agents'] ? <Maximize2 className="w-3 h-3" /> : <Minimize2 className="w-3 h-3" />}
            </button>
          </div>

          {!minimizedScreens['agents'] && (
            <div className="space-y-2 text-[11px]">
              {agents.slice(0, 3).map(ag => (
                <div key={ag.id} className="p-2 rounded bg-white/5 border border-purple-500/20 flex items-center justify-between">
                  <div>
                    <p className="font-bold text-white text-[11px]">{ag.name}</p>
                    <p className="text-[9px] text-purple-300">{ag.currentTask || 'Nominal status'}</p>
                  </div>
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300">
                    {ag.progress}%
                  </span>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {/* SCREEN 3: TOP RIGHT — SPATIAL VISION HUD */}
        <motion.div
          initial={{ opacity: 0, x: 100, scale: 0.9 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: 100, scale: 0.9 }}
          transition={{ duration: 0.4, delay: 0.15 }}
          className="absolute top-28 right-6 w-80 pointer-events-auto glass-card bg-[#020617]/85 border border-cyan-500/30 rounded-2xl p-4 shadow-2xl backdrop-blur-xl font-mono text-white"
        >
          <div className="flex items-center justify-between border-b border-cyan-500/20 pb-2 mb-3">
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-bold text-emerald-300 tracking-wider">HUD :: SPATIAL VISION</span>
            </div>
            <button onClick={() => toggleMinimize('vision')} className="p-1 hover:text-emerald-400 text-white/60">
              {minimizedScreens['vision'] ? <Maximize2 className="w-3 h-3" /> : <Minimize2 className="w-3 h-3" />}
            </button>
          </div>

          {!minimizedScreens['vision'] && (
            <div className="space-y-2 text-[11px]">
              <div className="h-28 rounded-lg bg-black/80 border border-emerald-500/30 relative flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:12px_12px] opacity-20" />
                <div className="w-10 h-10 rounded-full border border-emerald-400/60 animate-ping absolute" />
                <span className="text-[10px] font-bold text-emerald-400 z-10">60 FPS RETICLE LOCKED</span>
              </div>
              {visionDetections.slice(0, 2).map(det => (
                <div key={det.id} className="p-1.5 rounded bg-white/5 border border-emerald-500/20 flex justify-between text-[10px]">
                  <span className="text-white/80">{det.label}</span>
                  <span className="text-emerald-400 font-bold">{(det.confidence * 100).toFixed(0)}%</span>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {/* SCREEN 4: BOTTOM RIGHT — CODE & TERMINAL DIRECTIVE HUD */}
        <motion.div
          initial={{ opacity: 0, x: 100, scale: 0.9 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: 100, scale: 0.9 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="absolute bottom-24 right-6 w-80 pointer-events-auto glass-card bg-[#020617]/85 border border-cyan-500/30 rounded-2xl p-4 shadow-2xl backdrop-blur-xl font-mono text-white"
        >
          <div className="flex items-center justify-between border-b border-cyan-500/20 pb-2 mb-3">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-cyan-400" />
              <span className="text-xs font-bold text-cyan-300 tracking-wider">HUD :: DIRECTIVES</span>
            </div>
            <button onClick={() => toggleMinimize('terminal')} className="p-1 hover:text-cyan-400 text-white/60">
              {minimizedScreens['terminal'] ? <Maximize2 className="w-3 h-3" /> : <Minimize2 className="w-3 h-3" />}
            </button>
          </div>

          {!minimizedScreens['terminal'] && (
            <div className="space-y-2 text-[10px]">
              <div className="p-2 rounded bg-black/80 border border-cyan-500/20 text-cyan-300 font-mono space-y-1">
                <p className="text-[9px] text-white/40">// Quick Directives</p>
                <button 
                  onClick={() => onExecuteCommand('sysinfo')}
                  className="w-full text-left p-1 rounded hover:bg-cyan-500/20 transition-colors flex items-center gap-1.5"
                >
                  <Command className="w-3 h-3" /> Execute `sysinfo`
                </button>
                <button 
                  onClick={() => onExecuteCommand('scan')}
                  className="w-full text-left p-1 rounded hover:bg-cyan-500/20 transition-colors flex items-center gap-1.5"
                >
                  <Code2 className="w-3 h-3" /> Execute `scan`
                </button>
              </div>

              {osActions.slice(0, 2).map(act => (
                <div key={act.id} className="p-1.5 rounded bg-white/5 border border-white/10 flex justify-between">
                  <span className="text-white/70 truncate">{act.title}</span>
                  <span className="text-emerald-400 font-bold">{act.status}</span>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
