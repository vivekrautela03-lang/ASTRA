import React from 'react';
import { Camera, CameraOff, Video } from 'lucide-react';

interface CameraBackgroundProps {
  isActive: boolean;
  hasPermission: boolean | null;
  onEnableCamera: () => void;
  bindVideoRef: (el: HTMLVideoElement | null) => void;
  className?: string;
}

export const CameraBackground: React.FC<CameraBackgroundProps> = ({
  isActive,
  hasPermission,
  onEnableCamera,
  bindVideoRef,
  className = ''
}) => {
  return (
    <div className={`fixed inset-0 z-0 overflow-hidden select-none bg-black ${className}`}>
      {/* 1. Real-time Live Camera Video Element */}
      <video
        ref={bindVideoRef}
        autoPlay
        playsInline
        muted
        className={`absolute inset-0 w-full h-full object-cover -scale-x-100 transition-opacity duration-700 ${
          isActive ? 'opacity-85' : 'opacity-0'
        }`}
      />

      {/* 2. AR Cinematic Liquid Tint & Optics Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/25 to-black/60 pointer-events-none" />

      {/* 3. Subtle Cybernetic AR Scanlines & Vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_40%,rgba(0,0,0,0.7)_100%)] pointer-events-none" />

      {/* 4. Subtle Sci-Fi AR Target Crosshairs */}
      <div className="absolute inset-8 border border-cyan-500/10 rounded-3xl pointer-events-none flex flex-col justify-between p-6">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-black/40 backdrop-blur-md border border-cyan-500/20 text-[10px] font-mono text-cyan-300">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
            <span>AR OPTICAL FEED // ACTIVE</span>
          </div>
          <span className="text-[10px] font-mono text-white/30 tracking-widest uppercase">
            ASTRA SPATIAL SENSOR v10
          </span>
        </div>
        <div className="flex justify-between items-end">
          <span className="text-[9px] font-mono text-white/30 tracking-wider">
            OPTIC MATRIX • 1080P FHD
          </span>
          <span className="text-[9px] font-mono text-cyan-400/50">
            LATENCY &lt; 15MS
          </span>
        </div>
      </div>

      {/* 5. Permission Banner when Camera is Not Yet Active */}
      {!isActive && hasPermission === false && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center p-6 bg-black/80 backdrop-blur-xl animate-in fade-in">
          <div className="max-w-md w-full p-6 rounded-3xl liquid-glass flex flex-col items-center text-center gap-4 shadow-2xl">
            <div className="w-12 h-12 rounded-2xl liquid-glass-pill flex items-center justify-center text-cyan-300 shadow-[0_0_20px_rgba(0,191,255,0.4)]">
              <CameraOff className="w-6 h-6" />
            </div>
            <div className="flex flex-col gap-1">
              <h3 className="text-base font-bold text-white tracking-wide">
                Camera Access Needed for AR Mode
              </h3>
              <p className="text-xs text-white/60 leading-relaxed font-sans">
                ASTRA uses your laptop's camera to create a futuristic real-time liquid glass AR background experience.
              </p>
            </div>
            <button
              type="button"
              onClick={onEnableCamera}
              className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-[#00BFFF] to-blue-600 hover:brightness-110 text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-[0_0_25px_rgba(0,191,255,0.5)] transition-all active:scale-95"
            >
              <Camera className="w-4 h-4" />
              <span>Allow Camera Access</span>
            </button>
          </div>
        </div>
      )}

      {/* Initial Perm Request Prompt if null */}
      {!isActive && hasPermission === null && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-20 animate-in fade-in slide-in-from-top-4">
          <button
            type="button"
            onClick={onEnableCamera}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full liquid-glass-pill text-cyan-300 text-xs font-semibold shadow-[0_0_25px_rgba(0,191,255,0.4)] hover:scale-105 transition-all"
          >
            <Video className="w-4 h-4 text-cyan-400 animate-pulse" />
            <span>Click to Enable Live Laptop Camera Background</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default CameraBackground;
