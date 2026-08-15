import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldAlert, AlertTriangle, Check, X, Terminal } from 'lucide-react';
import type { SafetyActionRequest } from '../../services/safetyGatekeeper';

interface ConfirmationModalProps {
  request: SafetyActionRequest | null;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({ request }) => {
  if (!request) return null;

  const isCritical = request.riskLevel === 'CRITICAL';
  const isHigh = request.riskLevel === 'HIGH';

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className={`w-full max-w-lg p-6 rounded-2xl border glass-card shadow-2xl font-mono text-white ${
            isCritical 
              ? 'border-red-500/50 bg-red-950/40 shadow-[0_0_30px_rgba(239,68,68,0.3)]' 
              : isHigh 
              ? 'border-amber-500/50 bg-amber-950/40 shadow-[0_0_30px_rgba(245,158,11,0.3)]'
              : 'border-cyan-500/40 bg-cyan-950/40 shadow-[0_0_30px_rgba(6,182,212,0.3)]'
          }`}
        >
          {/* Header */}
          <div className="flex items-center gap-3 mb-4">
            <div className={`p-2.5 rounded-xl ${
              isCritical ? 'bg-red-500/20 text-red-400 border border-red-500/40' : 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
            }`}>
              {isCritical ? <ShieldAlert className="w-6 h-6 animate-pulse" /> : <AlertTriangle className="w-6 h-6 animate-pulse" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-extrabold tracking-wider text-white">
                  JARVIS SAFETY AUTHORIZATION
                </h3>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                  isCritical ? 'bg-red-500/30 text-red-300 border border-red-500/50' : 'bg-amber-500/30 text-amber-300 border border-amber-500/50'
                }`}>
                  {request.riskLevel} RISK
                </span>
              </div>
              <p className="text-xs text-white/60">Explicit user authorization required for high-risk operation.</p>
            </div>
          </div>

          {/* Action Details */}
          <div className="p-4 rounded-xl bg-black/60 border border-white/10 space-y-2 mb-6 text-xs">
            <div className="flex justify-between border-b border-white/10 pb-2">
              <span className="text-white/60">Action Directive:</span>
              <span className="text-cyan-300 font-bold">{request.actionTitle}</span>
            </div>
            <p className="text-white/80 leading-relaxed pt-1">{request.actionDetails}</p>
            {request.command && (
              <div className="mt-2 p-2 rounded bg-white/5 border border-white/10 text-[11px] text-emerald-400 flex items-center gap-2">
                <Terminal className="w-3.5 h-3.5" />
                <code>{request.command}</code>
              </div>
            )}
          </div>

          {/* Confirmation Buttons */}
          <div className="flex items-center justify-end gap-3 font-mono text-xs">
            <button
              onClick={request.onCancel}
              className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white border border-white/10 transition-colors flex items-center gap-1.5"
            >
              <X className="w-4 h-4" /> Cancel Directive
            </button>
            <button
              onClick={request.onConfirm}
              className={`px-5 py-2.5 rounded-xl font-bold transition-all flex items-center gap-1.5 shadow-lg ${
                isCritical 
                  ? 'bg-red-500 hover:bg-red-600 text-white shadow-red-500/30' 
                  : 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-cyan-500/30'
              }`}
            >
              <Check className="w-4 h-4" /> Authorize Action
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
