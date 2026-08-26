import React from 'react';
import {
  Calendar,
  Globe,
  Focus,
  Music,
  CheckCircle,
  Cpu,
  ShieldCheck,
  Sparkles
} from 'lucide-react';

interface QuickCommandsProps {
  onSelectCommand: (command: string) => void;
  className?: string;
}

export const QuickCommands: React.FC<QuickCommandsProps> = ({
  onSelectCommand,
  className = ''
}) => {
  const chips = [
    { label: 'Summarize my day', icon: Sparkles, prompt: 'Summarize my day and prioritize my tasks.' },
    { label: 'Open calendar', icon: Calendar, prompt: 'Open my calendar and show today’s meetings.' },
    { label: 'Search the web', icon: Globe, prompt: 'Search the web for the latest AI operating system advancements.' },
    { label: 'Start focus mode', icon: Focus, prompt: 'Activate focus mode and mute low-priority notifications.' },
    { label: 'Play music', icon: Music, prompt: 'Play focus ambient music in the background.' },
    { label: 'Create reminder', icon: CheckCircle, prompt: 'Create a reminder for my next project milestone.' },
    { label: 'Robotics HUD', icon: Cpu, prompt: 'Open robotics telemetry and kinematic visualizer.' },
    { label: 'Security check', icon: ShieldCheck, prompt: 'Run security sandbox integrity diagnostics.' },
  ];

  return (
    <div className={`flex flex-wrap items-center justify-center gap-2 select-none ${className}`}>
      {chips.map((chip, idx) => {
        const Icon = chip.icon;
        return (
          <button
            key={idx}
            type="button"
            onClick={() => onSelectCommand(chip.prompt)}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#050f1e]/60 hover:bg-cyan-500/15 border border-cyan-500/20 hover:border-cyan-500/40 text-xs font-sans text-white/80 hover:text-cyan-200 backdrop-blur-xl transition-all shadow-[0_4px_12px_rgba(0,0,0,0.4)] active:scale-95"
          >
            <Icon className="w-3.5 h-3.5 text-cyan-400" />
            <span>{chip.label}</span>
          </button>
        );
      })}
    </div>
  );
};

export default QuickCommands;
