import React, { useState } from 'react';
import {
  MessageSquare,
  Mic,
  Search,
  CheckSquare,
  Calendar,
  Folder,
  Settings,
  Cpu,
  Shield,
  Layers
} from 'lucide-react';

export type SidebarTab =
  | 'chat'
  | 'voice'
  | 'search'
  | 'tasks'
  | 'calendar'
  | 'files'
  | 'robotics'
  | 'security'
  | 'apis'
  | 'settings';

interface SideBarProps {
  activeTab: SidebarTab;
  onSelectTab: (tab: SidebarTab) => void;
  className?: string;
}

export const SideBar: React.FC<SideBarProps> = ({
  activeTab,
  onSelectTab,
  className = ''
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const items = [
    { id: 'chat', label: 'Chat HUD', icon: MessageSquare },
    { id: 'voice', label: 'Voice Mode', icon: Mic },
    { id: 'search', label: 'Neural Search', icon: Search },
    { id: 'tasks', label: 'Task Studio', icon: CheckSquare },
    { id: 'calendar', label: 'Calendar', icon: Calendar },
    { id: 'files', label: 'File Vault', icon: Folder },
    { id: 'robotics', label: 'Robotics HUD', icon: Cpu },
    { id: 'security', label: 'Security Center', icon: Shield },
    { id: 'apis', label: 'Public APIs', icon: Layers },
    { id: 'settings', label: 'System Settings', icon: Settings },
  ];

  return (
    <aside
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`fixed left-6 top-1/2 -translate-y-1/2 z-40 flex flex-col gap-2 p-2 rounded-2xl bg-[#050f1e]/75 border border-cyan-500/20 backdrop-blur-2xl shadow-[0_15px_35px_rgba(0,0,0,0.6)] transition-all duration-300 select-none ${
        isHovered ? 'w-48' : 'w-14'
      } ${className}`}
    >
      <div className="flex flex-col gap-1">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelectTab(item.id as SidebarTab)}
              className={`flex items-center gap-3 w-full p-2.5 rounded-xl text-xs font-medium transition-all ${
                isActive
                  ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/10 text-cyan-300 border border-cyan-500/30 shadow-[0_0_15px_rgba(0,191,255,0.2)]'
                  : 'text-[#6B8299] hover:text-white hover:bg-white/5 border border-transparent'
              }`}
            >
              <div className="relative shrink-0 flex items-center justify-center">
                <Icon className={`w-4 h-4 transition-transform ${isActive ? 'scale-110 text-cyan-300' : ''}`} />
                {isActive && (
                  <span className="absolute -top-1 -right-1 w-1.5 h-1.5 rounded-full bg-[#00BFFF]" />
                )}
              </div>

              {isHovered && (
                <span className="whitespace-nowrap font-sans font-medium tracking-wide animate-in fade-in">
                  {item.label}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </aside>
  );
};

export default SideBar;
