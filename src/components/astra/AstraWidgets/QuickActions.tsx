import React from 'react';
import { Mic, Camera, CloudSun, Clock, Database, Settings, Square } from 'lucide-react';
import type { EvaState } from '../../../types/eva';

interface QuickActionsProps {
  state: EvaState;
  onToggleVoice: () => void;
  onToggleCamera: () => void;
  onToggleWeather: () => void;
  onToggleTime: () => void;
  onToggleRAG: () => void;
  onOpenSettings: () => void;
  onStopSpeaking?: () => void;
}

export const QuickActions: React.FC<QuickActionsProps> = ({
  state,
  onToggleVoice,
  onToggleCamera,
  onToggleWeather,
  onToggleTime,
  onToggleRAG,
  onOpenSettings,
  onStopSpeaking
}) => {
  return (
    <div className="p-2 rounded-full bg-slate-950/70 border border-white/20 backdrop-blur-3xl shadow-2xl flex items-center gap-2">
      {/* Voice Mic Action */}
      <button
        onClick={onToggleVoice}
        className={`p-3 rounded-full border transition-all active:scale-95 ${
          state === 'listening' || state === 'speaking'
            ? 'bg-amber-400 text-black border-amber-300 shadow-[0_0_20px_rgba(245,158,11,0.9)] animate-pulse'
            : 'bg-white/10 border-white/15 text-amber-200 hover:bg-white/20'
        }`}
        title="Toggle Voice Input"
      >
        <Mic className="w-4 h-4" />
      </button>

      {/* Stop Speaking Action */}
      {state === 'speaking' && onStopSpeaking && (
        <button
          onClick={onStopSpeaking}
          className="p-3 rounded-full bg-rose-500/80 hover:bg-rose-500 text-white border border-rose-400 shadow-lg active:scale-95 transition-all"
          title="Stop Speaking"
        >
          <Square className="w-4 h-4 fill-current" />
        </button>
      )}

      {/* Camera Action */}
      <button
        onClick={onToggleCamera}
        className="p-3 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 text-white transition-all active:scale-95"
        title="Toggle Camera Preview"
      >
        <Camera className="w-4 h-4 text-cyan-300" />
      </button>

      {/* RAG Knowledge Store Action */}
      <button
        onClick={onToggleRAG}
        className="p-3 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 text-white transition-all active:scale-95"
        title="ASTRA Vector RAG Knowledge Base"
      >
        <Database className="w-4 h-4 text-purple-300" />
      </button>

      {/* Weather Action */}
      <button
        onClick={onToggleWeather}
        className="p-3 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 text-white transition-all active:scale-95"
        title="Weather Widget"
      >
        <CloudSun className="w-4 h-4 text-amber-300" />
      </button>

      {/* Time Action */}
      <button
        onClick={onToggleTime}
        className="p-3 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 text-white transition-all active:scale-95"
        title="Time & Date Widget"
      >
        <Clock className="w-4 h-4 text-cyan-300" />
      </button>

      {/* Settings Action */}
      <button
        onClick={onOpenSettings}
        className="p-3 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 text-white transition-all active:scale-95"
        title="ASTRA System Settings"
      >
        <Settings className="w-4 h-4 text-slate-200" />
      </button>
    </div>
  );
};
