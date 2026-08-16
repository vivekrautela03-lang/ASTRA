import React from 'react';
import { EvaCanvasContainer } from '../canvas/EvaCanvasContainer';
import type { EvaState } from '../../types/eva';
import { Sparkles, Mic, Brain, Volume2, AlertCircle } from 'lucide-react';

interface AstraOrbProps {
  state: EvaState;
  audioLevel?: number;
  onOrbClick?: () => void;
}

export const AstraOrb: React.FC<AstraOrbProps> = ({
  state,
  audioLevel = 0.2,
  onOrbClick
}) => {
  const getStatusBadge = () => {
    switch (state) {
      case 'listening':
        return {
          label: 'LISTENING...',
          icon: Mic,
          color: 'text-amber-300 border-amber-500/50 bg-amber-950/40 shadow-[0_0_20px_rgba(245,158,11,0.4)] animate-pulse'
        };
      case 'thinking':
        return {
          label: 'THINKING...',
          icon: Brain,
          color: 'text-purple-300 border-purple-500/50 bg-purple-950/40 shadow-[0_0_20px_rgba(168,85,247,0.4)] animate-pulse'
        };
      case 'speaking':
        return {
          label: 'ASTRA IS SPEAKING',
          icon: Volume2,
          color: 'text-yellow-200 border-yellow-400/50 bg-yellow-950/40 shadow-[0_0_20px_rgba(250,204,21,0.4)] animate-pulse'
        };
      case 'executing':
        return {
          label: 'EXECUTING...',
          icon: Sparkles,
          color: 'text-cyan-300 border-cyan-500/50 bg-cyan-950/40 shadow-[0_0_20px_rgba(6,182,212,0.4)]'
        };
      case 'error':
        return {
          label: 'ATTENTION',
          icon: AlertCircle,
          color: 'text-rose-300 border-rose-500/50 bg-rose-950/40 shadow-[0_0_20px_rgba(244,63,94,0.4)]'
        };
      case 'idle':
      default:
        return {
          label: 'ASTRA ONLINE',
          icon: Sparkles,
          color: 'text-amber-200/80 border-amber-500/30 bg-black/40 shadow-[0_0_15px_rgba(245,158,11,0.2)]'
        };
    }
  };

  const badge = getStatusBadge();
  const Icon = badge.icon;

  return (
    <div className="relative flex flex-col items-center justify-center">
      {/* Status Pill Header */}
      <div
        onClick={onOrbClick}
        className={`cursor-pointer px-4 py-1.5 rounded-full border backdrop-blur-2xl text-xs font-mono tracking-widest flex items-center gap-2 mb-2 transition-all ${badge.color}`}
      >
        <Icon className="w-3.5 h-3.5" />
        <span>{badge.label}</span>
      </div>

      {/* 3D Golden Mechanical Orb Canvas Container */}
      <div className="w-[320px] h-[320px] md:w-[420px] md:h-[420px] relative">
        <EvaCanvasContainer state={state} audioLevel={audioLevel} />
      </div>
    </div>
  );
};
