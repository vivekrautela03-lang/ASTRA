import React from 'react';
import { Hand, ZoomIn, RefreshCcw, Sparkles, Move3D, Eye, EyeOff } from 'lucide-react';
import type { GestureData } from '../../services/handGestureEngine';

interface GestureHUDProps {
  gestureData: GestureData;
  isTracking: boolean;
  onToggleTracking: () => void;
  onReset: () => void;
  className?: string;
}

export const GestureHUD: React.FC<GestureHUDProps> = ({
  gestureData,
  isTracking,
  onToggleTracking,
  onReset,
  className = ''
}) => {
  const isInteracting = isTracking && gestureData.gesture !== 'IDLE' && gestureData.confidence > 0.2;

  return (
    <div className={`flex flex-col items-center gap-2 select-none pointer-events-auto ${className}`}>
      {/* 1. Main Gesture Status Pill */}
      <div className="flex items-center gap-2.5 px-4 py-1.5 rounded-full liquid-glass-pill shadow-[0_0_20px_rgba(0,191,255,0.25)] backdrop-blur-2xl">
        <div className="flex items-center justify-center">
          {gestureData.gesture === 'PINCH_ZOOM' ? (
            <ZoomIn className="w-3.5 h-3.5 text-cyan-300 animate-bounce" />
          ) : gestureData.gesture === 'FIST_CONDENSE' ? (
            <Sparkles className="w-3.5 h-3.5 text-purple-300 animate-spin" />
          ) : gestureData.gesture === 'PALM_MOVE' || gestureData.gesture === 'SWIPE_SPIN' ? (
            <Move3D className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
          ) : (
            <Hand className="w-3.5 h-3.5 text-white/50" />
          )}
        </div>

        <span className="text-[10px] font-mono tracking-wider font-semibold text-cyan-200">
          {!isTracking
            ? 'GESTURE TRACKING PAUSED'
            : isInteracting
            ? gestureData.label
            : 'GESTURE TRACKING ACTIVE'}
        </span>

        {/* Dynamic Scale & Rotation Metrics */}
        {isInteracting && (
          <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
            {gestureData.scale.toFixed(2)}x
          </span>
        )}

        {/* Toggle Tracking Mode Button */}
        <button
          type="button"
          onClick={onToggleTracking}
          title={isTracking ? 'Pause Hand Gestures' : 'Resume Hand Gestures'}
          className="p-1 rounded-lg text-white/50 hover:text-cyan-300 hover:bg-white/10 transition-colors ml-0.5"
        >
          {isTracking ? <Eye className="w-3 h-3 text-cyan-400" /> : <EyeOff className="w-3 h-3 text-rose-400" />}
        </button>

        {/* Reset Transform Button */}
        <button
          type="button"
          onClick={onReset}
          title="Reset Orb Position & Scale"
          className="p-1 rounded-lg text-white/50 hover:text-cyan-300 hover:bg-white/10 transition-colors"
        >
          <RefreshCcw className="w-3 h-3" />
        </button>
      </div>

      {/* 2. Helper Hint */}
      <div className="text-[9px] font-mono text-white/40 tracking-wider flex items-center gap-3">
        <span>✋ Move: Rotate</span>
        <span>•</span>
        <span>🤏 Spread: Zoom</span>
        <span>•</span>
        <span>✊ Fist: Condense</span>
        <span>•</span>
        <span>🔄 Swipe: Spin</span>
      </div>
    </div>
  );
};

export default GestureHUD;
