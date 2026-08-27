import React, { useState } from 'react';
import {
  MessageSquare,
  Mic,
  Blocks,
  CheckSquare,
  Calendar,
  Folder,
  Settings,
  Shield
} from 'lucide-react';

export type SidebarTab =
  | 'chat'
  | 'voice'
  | 'plugins'
  | 'tasks'
  | 'calendar'
  | 'files'
  | 'security'
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
    { id: 'plugins', label: 'Plugins & APIs', icon: Blocks },
    { id: 'tasks', label: 'Task Studio', icon: CheckSquare },
    { id: 'calendar', label: 'Calendar', icon: Calendar },
    { id: 'files', label: 'File Vault', icon: Folder },
    { id: 'security', label: 'Security Center', icon: Shield },
    { id: 'settings', label: 'System Settings', icon: Settings },
  ];

  return (
    <aside
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`fixed left-6 top-1/2 -translate-y-1/2 z-40 flex flex-col gap-2 p-2.5 rounded-3xl liquid-glass transition-all duration-300 select-none ${
        isHovered ? 'w-52' : 'w-16'
      } ${className}`}
    >
      {items.map((item) => {
        const Icon = item.icon;
        const isActive = activeTab === item.id;

        return (
          <button
            key={item.id}
            type="button"
            onClick={() => onSelectTab(item.id as SidebarTab)}
            className={`relative flex items-center gap-3.5 p-2.5 rounded-2xl transition-all duration-200 group text-left ${
              isActive
                ? 'bg-cyan-500/20 text-[#00BFFF] border border-cyan-500/40 shadow-[0_0_20px_rgba(0,191,255,0.35)]'
                : 'text-white/60 hover:text-cyan-300 hover:bg-white/[0.08]'
            }`}
          >
            {/* Active Indicator Pip */}
            {isActive && (
              <span className="absolute -left-1 top-1/2 -translate-y-1/2 w-1.5 h-4 bg-[#00BFFF] rounded-r-full shadow-[0_0_10px_#00BFFF]" />
            )}

            <div className="w-5 h-5 flex items-center justify-center shrink-0">
              <Icon
                className={`w-4 h-4 transition-transform group-hover:scale-110 ${
                  isActive ? 'text-[#00BFFF]' : ''
                }`}
              />
            </div>

            {/* Label (Visible on hover or expanded) */}
            <span
              className={`text-xs font-semibold tracking-wide whitespace-nowrap overflow-hidden transition-all duration-300 ${
                isHovered
                  ? 'opacity-100 max-w-[130px]'
                  : 'opacity-0 max-w-0 pointer-events-none'
              }`}
            >
              {item.label}
            </span>
          </button>
        );
      })}
    </aside>
  );
};

export default SideBar;
