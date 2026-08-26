import React, { useState } from 'react';
import { Sparkles, Bell, Settings, Volume2, VolumeX, User, CheckCircle2 } from 'lucide-react';

interface TopBarProps {
  soundEnabled: boolean;
  onToggleSound: () => void;
  onOpenSettings: () => void;
  onOpenNotifications?: () => void;
  userEmail?: string | null;
  className?: string;
}

export const TopBar: React.FC<TopBarProps> = ({
  soundEnabled,
  onToggleSound,
  onOpenSettings,
  onOpenNotifications,
  userEmail = 'Operator',
  className = ''
}) => {
  const [showNotifs, setShowNotifs] = useState(false);

  const notifications = [
    { id: 1, title: 'Neural Core Synchronized', time: 'Just now' },
    { id: 2, title: 'Autonomous Sandbox Active', time: '2m ago' },
    { id: 3, title: 'Public APIs Catalog Loaded (1,400+ endpoints)', time: '5m ago' }
  ];

  return (
    <header className={`w-full flex items-center justify-between px-6 py-4 z-40 bg-gradient-to-b from-[#030712]/90 to-transparent backdrop-blur-md border-b border-cyan-500/10 select-none ${className}`}>
      {/* 1. Left Brand Identity */}
      <div className="flex items-center gap-3">
        <div className="relative flex items-center justify-center w-8 h-8 rounded-xl bg-cyan-500/10 border border-cyan-500/30 shadow-[0_0_15px_rgba(0,191,255,0.25)]">
          <Sparkles className="w-4 h-4 text-[#00BFFF] animate-pulse" />
        </div>
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className="font-extrabold tracking-[0.25em] text-sm text-transparent bg-clip-text bg-gradient-to-r from-white via-cyan-100 to-[#00BFFF]">
              ASTRA
            </span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-mono">
              v10.0
            </span>
          </div>
          <span className="text-[9px] font-mono tracking-widest text-[#6B8299] uppercase">
            PERSONAL AI OPERATING SYSTEM
          </span>
        </div>
      </div>

      {/* 2. Center/Right Navigation & Status */}
      <div className="flex items-center gap-4">
        {/* Connection Indicator */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#050f1e]/80 border border-cyan-500/20 shadow-[0_0_15px_rgba(0,191,255,0.15)]">
          <div className="relative flex items-center justify-center w-2 h-2">
            <div className="w-2 h-2 rounded-full bg-[#00BFFF] animate-ping absolute" />
            <div className="w-1.5 h-1.5 rounded-full bg-[#00BFFF]" />
          </div>
          <span className="text-[11px] font-mono tracking-wider text-cyan-300 font-semibold">
            ASTRA ONLINE
          </span>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5 bg-[#050f1e]/60 border border-cyan-500/15 rounded-xl p-1 backdrop-blur-xl">
          {/* Sound Toggle */}
          <button
            type="button"
            onClick={onToggleSound}
            title={soundEnabled ? 'Mute voice feedback' : 'Enable voice feedback'}
            className="p-2 rounded-lg text-[#6B8299] hover:text-cyan-300 hover:bg-cyan-500/10 transition-colors"
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
              className="p-2 rounded-lg text-[#6B8299] hover:text-cyan-300 hover:bg-cyan-500/10 transition-colors relative"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-cyan-400" />
            </button>

            {showNotifs && (
              <div className="absolute right-0 mt-2 w-72 p-3 rounded-2xl bg-[#050f1e]/95 border border-cyan-500/30 backdrop-blur-2xl shadow-[0_10px_30px_rgba(0,0,0,0.8)] z-50 animate-in fade-in slide-in-from-top-2">
                <div className="flex items-center justify-between pb-2 border-b border-cyan-500/15 text-xs font-mono text-cyan-300">
                  <span>TELEMETRY FEED</span>
                  <span className="text-[10px] text-[#6B8299]">3 NEW</span>
                </div>
                <div className="flex flex-col gap-2 mt-2">
                  {notifications.map((n) => (
                    <div key={n.id} className="p-2 rounded-xl bg-cyan-950/20 border border-cyan-500/10 flex items-start gap-2">
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
            className="p-2 rounded-lg text-[#6B8299] hover:text-cyan-300 hover:bg-cyan-500/10 transition-colors"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>

        {/* User Profile Avatar */}
        <div className="flex items-center gap-2 pl-2 border-l border-cyan-500/15" title={userEmail || 'Operator'}>
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-cyan-600 to-blue-500 flex items-center justify-center text-white text-xs font-bold shadow-[0_0_12px_rgba(0,191,255,0.3)]">
            <User className="w-4 h-4" />
          </div>
        </div>
      </div>
    </header>
  );
};

export default TopBar;
