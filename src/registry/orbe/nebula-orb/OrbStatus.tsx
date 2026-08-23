import React from 'react';
import type { OrbStatusProps } from './types';
import { Sparkles, Mic, Brain, Volume2, AlertCircle, Loader2 } from 'lucide-react';

export const OrbStatus: React.FC<OrbStatusProps> = ({
  state,
  customText,
  className = '',
  showIcon = true
}) => {
  const getStatusConfig = () => {
    switch (state) {
      case 'connecting':
        return {
          label: customText || 'Connecting...',
          icon: Loader2,
          iconClass: 'animate-spin text-sky-400',
          textColor: 'text-sky-300'
        };
      case 'listening':
        return {
          label: customText || 'Listening...',
          icon: Mic,
          iconClass: 'animate-pulse text-purple-400',
          textColor: 'text-purple-300'
        };
      case 'thinking':
        return {
          label: customText || 'Thinking...',
          icon: Brain,
          iconClass: 'animate-pulse text-fuchsia-400',
          textColor: 'text-fuchsia-300'
        };
      case 'speaking':
        return {
          label: customText || 'Astra is speaking...',
          icon: Volume2,
          iconClass: 'animate-pulse text-pink-400',
          textColor: 'text-pink-200'
        };
      case 'error':
        return {
          label: customText || 'Something went wrong. Try again.',
          icon: AlertCircle,
          iconClass: 'text-rose-400',
          textColor: 'text-rose-300'
        };
      case 'disabled':
        return {
          label: customText || 'Astra Offline',
          icon: Sparkles,
          iconClass: 'text-slate-500',
          textColor: 'text-slate-400'
        };
      case 'idle':
      default:
        return {
          label: customText || 'Ask me anything.',
          icon: Sparkles,
          iconClass: 'text-purple-400',
          textColor: 'text-white/80'
        };
    }
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  return (
    <div
      role="status"
      aria-live="polite"
      className={`flex items-center justify-center gap-2 text-xs font-medium tracking-wide transition-all duration-300 ${config.textColor} ${className}`}
    >
      {showIcon && <Icon className={`w-3.5 h-3.5 shrink-0 ${config.iconClass}`} aria-hidden="true" />}
      <span className="truncate">{config.label}</span>
    </div>
  );
};
