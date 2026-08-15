import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BatteryCharging, AlertTriangle, Calendar, X, Sparkles } from 'lucide-react';
import type { ProactiveAlert } from '../../services/proactiveMonitorService';

interface ProactiveAlertBannerProps {
  alert: ProactiveAlert | null;
  onDismiss: () => void;
}

export const ProactiveAlertBanner: React.FC<ProactiveAlertBannerProps> = ({ alert, onDismiss }) => {
  if (!alert) return null;

  const getIcon = () => {
    switch (alert.type) {
      case 'battery': return <BatteryCharging className="w-4 h-4 text-amber-400" />;
      case 'weather': return <AlertTriangle className="w-4 h-4 text-cyan-400" />;
      case 'calendar': return <Calendar className="w-4 h-4 text-purple-400" />;
      default: return <Sparkles className="w-4 h-4 text-cyan-400" />;
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -20, scale: 0.95 }}
        className="fixed top-20 right-6 z-50 max-w-sm w-full p-4 rounded-2xl glass-card border border-cyan-400/40 bg-cyan-950/80 backdrop-blur-xl shadow-[0_0_25px_rgba(6,182,212,0.25)] text-white font-mono"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-cyan-500/20 border border-cyan-400/30 flex-shrink-0">
              {getIcon()}
            </div>
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-xs font-bold text-cyan-300">{alert.title}</span>
                <span className="text-[9px] text-white/40">{alert.timestamp}</span>
              </div>
              <p className="text-xs text-white/80 leading-relaxed">{alert.message}</p>
            </div>
          </div>
          <button
            onClick={onDismiss}
            className="p-1 rounded-lg bg-white/5 hover:bg-white/15 text-white/60 hover:text-white transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
