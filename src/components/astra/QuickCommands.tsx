import React from 'react';
import {
  Calendar,
  Globe,
  Focus,
  Music,
  CheckCircle,
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
    { label: 'Security check', icon: ShieldCheck, prompt: 'Run security sandbox integrity diagnostics.' },
  ];

  return (
    <div className={`flex flex-wrap items-center justify-center gap-2.5 select-none ${className}`}>
      {chips.map((chip, idx) => {
        const Icon = chip.icon;
        return (
          <button
            key={idx}
            type="button"
            onClick={() => onSelectCommand(chip.prompt)}
            className="flex items-center gap-2 px-4 py-2 rounded-full liquid-glass-chip text-xs font-sans text-white/90 hover:text-cyan-200 active:scale-95"
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
