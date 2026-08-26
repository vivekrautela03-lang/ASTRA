import React, { useState } from 'react';
import {
  Activity,
  Cpu,
  Mic,
  Database,
  Wifi,
  Clock,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  ShieldCheck,
  ExternalLink
} from 'lucide-react';

interface SystemPanelProps {
  currentMode?: string;
  onManageMemory?: () => void;
  className?: string;
}

export const SystemPanel: React.FC<SystemPanelProps> = ({
  currentMode = 'Assistant',
  onManageMemory,
  className = ''
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const systemStats = [
    { label: 'AI Core', status: 'ONLINE', icon: Cpu, color: 'text-cyan-400' },
    { label: 'Voice Engine', status: 'READY', icon: Mic, color: 'text-emerald-400' },
    { label: 'Memory Core', status: 'ACTIVE', icon: Database, color: 'text-purple-400' },
    { label: 'Internet', status: 'CONNECTED', icon: Wifi, color: 'text-cyan-400' },
  ];

  const recentActivity = [
    { text: 'Calendar agenda synchronized', time: '10:14 AM' },
    { text: 'Weather telemetry updated', time: '10:02 AM' },
    { text: 'Autonomous sandboxing verified', time: '09:45 AM' },
    { text: 'Semantic knowledge indexed', time: '09:30 AM' },
  ];

  return (
    <aside
      className={`fixed right-6 top-24 bottom-24 z-30 flex flex-col transition-all duration-300 select-none ${
        isCollapsed ? 'w-10' : 'w-80'
      } ${className}`}
    >
      {/* Collapse Toggle Button */}
      <button
        type="button"
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -left-3 top-6 z-40 w-6 h-6 rounded-full bg-[#050f1e] border border-cyan-500/30 flex items-center justify-center text-cyan-300 hover:text-white shadow-lg"
      >
        {isCollapsed ? <ChevronLeft className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
      </button>

      {!isCollapsed && (
        <div className="w-full h-full flex flex-col gap-4 p-4 rounded-2xl bg-[#050f1e]/80 border border-cyan-500/20 backdrop-blur-2xl shadow-[0_15px_35px_rgba(0,0,0,0.7)] overflow-y-auto astra-scrollbar">
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-cyan-500/15">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-cyan-400" />
              <span className="font-mono text-xs font-bold tracking-widest text-cyan-200">
                ASTRA SYSTEM
              </span>
            </div>
            <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              STABLE
            </span>
          </div>

          {/* 1. System Status Grid */}
          <div className="flex flex-col gap-2">
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#6B8299]">
              SYSTEM STATUS
            </span>
            <div className="grid grid-cols-2 gap-2">
              {systemStats.map((stat, idx) => {
                const Icon = stat.icon;
                return (
                  <div
                    key={idx}
                    className="p-2.5 rounded-xl bg-cyan-950/20 border border-cyan-500/10 flex flex-col gap-1"
                  >
                    <div className="flex items-center justify-between">
                      <Icon className={`w-3.5 h-3.5 ${stat.color}`} />
                      <span className={`text-[9px] font-mono font-bold ${stat.color}`}>
                        {stat.status}
                      </span>
                    </div>
                    <span className="text-[11px] text-white/90 font-medium">{stat.label}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 2. Current Mode */}
          <div className="flex flex-col gap-2">
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#6B8299]">
              CURRENT MODE
            </span>
            <div className="p-3 rounded-xl bg-gradient-to-r from-cyan-950/40 to-blue-950/30 border border-cyan-500/20 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-white">{currentMode}</span>
                  <span className="text-[9px] text-[#6B8299] font-mono">Full Autonomy Enabled</span>
                </div>
              </div>
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
            </div>
          </div>

          {/* 3. Activity Timeline */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#6B8299]">
                ACTIVITY
              </span>
              <Clock className="w-3 h-3 text-[#6B8299]" />
            </div>
            <div className="flex flex-col gap-1.5">
              {recentActivity.map((act, idx) => (
                <div
                  key={idx}
                  className="p-2 rounded-lg bg-white/[0.02] border border-white/5 flex items-center justify-between text-xs"
                >
                  <span className="text-white/80 font-sans text-[11px] truncate">{act.text}</span>
                  <span className="text-[9px] font-mono text-[#6B8299] shrink-0">{act.time}</span>
                </div>
              ))}
            </div>
          </div>

          {/* 4. Memory Section */}
          <div className="flex flex-col gap-2 mt-auto pt-3 border-t border-cyan-500/15">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#6B8299]">
                NEURAL MEMORY
              </span>
              <Database className="w-3 h-3 text-purple-400" />
            </div>
            <p className="text-[11px] text-white/70 font-sans leading-relaxed">
              ASTRA continuously remembers your project contexts, preferences, and personal workflows.
            </p>
            <button
              type="button"
              onClick={onManageMemory}
              className="w-full mt-1 py-2 px-3 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all shadow-[0_0_15px_rgba(0,191,255,0.15)]"
            >
              <span>Manage Memory</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          </div>
        </div>
      )}
    </aside>
  );
};

export default SystemPanel;
