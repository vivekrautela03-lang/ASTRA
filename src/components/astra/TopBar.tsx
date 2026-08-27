import React, { useState } from 'react';
import { Bell, Settings, Volume2, VolumeX, Camera, CameraOff, User, CheckCircle2 } from 'lucide-react';
import { AstraLogo } from './AstraLogo';

interface TopBarProps {
  soundEnabled: boolean;
  onToggleSound: () => void;
  cameraActive?: boolean;
  onToggleCamera?: () => void;
  onOpenSettings: () => void;
  onOpenNotifications?: () => void;
  userEmail?: string | null;
  className?: string;
}

export const TopBar: React.FC<TopBarProps> = ({
  soundEnabled,
  onToggleSound,
  cameraActive = false,
  onToggleCamera,
  onOpenSettings,
  onOpenNotifications,
  userEmail = 'Operator',
  className = ''
}) => {
  const [showNotifs, setShowNotifs] = useState(false);

  const notifications = [
    { id: 1, title: 'Neural Core Synchronized', time: 'Just now' },
    { id: 2, title: 'AR Camera Vision Active', time: '1m ago' },
    { id: 3, title: 'Public APIs Catalog Loaded (1,400+ endpoints)', time: '5m ago' }
  ];

  return (
    <header className={`w-full flex items-center justify-between px-8 py-4 z-40 bg-transparent select-none ${className}`}>
      {/* 1. Left Brand Identity with Pure Transparent Logo */}
      <div className="flex items-center gap-3">
        <AstraLogo size="sm" align="left" showSubtitle={true} />
        <span className="text-[10px] px-2 py-0.5 rounded-full liquid-glass-pill text-cyan-300 font-mono tracking-wider ml-1">
          v10.0
        </span>
      </div>

      {/* 2. Center/Right Navigation & Status */}
      <div className="flex items-center gap-4">
        {/* AR Camera Indicator */}
        {cameraActive && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full liquid-glass-pill text-emerald-300 text-xs font-mono shadow-[0_0_15px_rgba(16,185,129,0.3)]">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>AR CAM ONLINE</span>
          </div>
        )}

        {/* Connection Indicator */}
        <div className="flex items-center gap-2.5 px-3.5 py-1.5 rounded-full liquid-glass-pill shadow-[0_0_20px_rgba(0,191,255,0.2)]">
          <div className="relative flex items-center justify-center w-2 h-2">
            <div className="w-2 h-2 rounded-full bg-[#00BFFF] animate-ping absolute" />
            <div className="w-1.5 h-1.5 rounded-full bg-[#00BFFF]" />
          </div>
          <span className="text-[11px] font-mono tracking-wider text-cyan-300 font-semibold">
            ASTRA ONLINE
          </span>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5 liquid-glass-card rounded-2xl p-1">
          {/* Camera AR Toggle */}
          {onToggleCamera && (
            <button
              type="button"
              onClick={onToggleCamera}
              title={cameraActive ? 'Disable Camera AR Background' : 'Enable Camera AR Background'}
              className={`p-2 rounded-xl transition-all ${
                cameraActive
                  ? 'text-emerald-400 bg-emerald-500/10 shadow-[0_0_12px_rgba(16,185,129,0.3)]'
                  : 'text-white/70 hover:text-cyan-300 hover:bg-white/10'
              }`}
            >
              {cameraActive ? <Camera className="w-4 h-4" /> : <CameraOff className="w-4 h-4" />}
            </button>
          )}

          {/* Sound Toggle */}
          <button
            type="button"
            onClick={onToggleSound}
            title={soundEnabled ? 'Mute voice feedback' : 'Enable voice feedback'}
            className="p-2 rounded-xl text-white/70 hover:text-cyan-300 hover:bg-white/10 transition-all"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-cyan-400" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Notifications Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setShowNotifs(!showNotifs);
                if (onOpenNotifications) onOpenNotifications();
              }}
              title="System Notifications"
              className="p-2 rounded-xl text-white/70 hover:text-cyan-300 hover:bg-white/10 transition-all relative"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-cyan-400" />
            </button>

            {showNotifs && (
              <div className="absolute right-0 mt-3 w-80 p-3.5 rounded-3xl liquid-glass shadow-[0_20px_50px_rgba(0,0,0,0.9)] z-50 animate-in fade-in slide-in-from-top-2">
                <div className="flex items-center justify-between pb-2.5 border-b border-white/10 text-xs font-mono text-cyan-300">
                  <span>TELEMETRY FEED</span>
                  <span className="text-[10px] text-white/50">3 NEW</span>
                </div>
                <div className="flex flex-col gap-2 mt-2.5">
                  {notifications.map((n) => (
                    <div key={n.id} className="p-2.5 rounded-2xl liquid-glass-card flex items-start gap-2.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                      <div className="flex flex-col">
                        <span className="text-xs text-white/90 font-sans">{n.title}</span>
                        <span className="text-[9px] font-mono text-[#6B8299]">{n.time}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Settings Trigger */}
          <button
            type="button"
            onClick={onOpenSettings}
            title="System Settings"
            className="p-2 rounded-xl text-white/70 hover:text-cyan-300 hover:bg-white/10 transition-all"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>

        {/* User Profile Avatar */}
        <div className="flex items-center gap-2 pl-2 border-l border-white/10" title={userEmail || 'Operator'}>
          <div className="w-9 h-9 rounded-2xl liquid-glass-card flex items-center justify-center text-white text-xs font-bold shadow-[0_0_15px_rgba(0,191,255,0.3)]">
            <User className="w-4 h-4 text-cyan-300" />
          </div>
        </div>
      </div>
    </header>
  );
};

export default TopBar;
