import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  ShieldCheck, AlertTriangle, CheckCircle, XCircle, 
  Lock, RefreshCw, Terminal, Eye
} from 'lucide-react';
import type { SecurityAuditEntry } from '../../types/eva';

export const AstraSecurityCenter: React.FC = () => {
  const [auditLogs, setAuditLogs] = useState<SecurityAuditEntry[]>([
    {
      id: 'log-1',
      actionType: 'READ',
      target: 'e:\\EV my personal assistant\\package.json',
      agentId: 'SystemAgent',
      status: 'AUTO_APPROVED',
      timestamp: new Date(Date.now() - 1000 * 60 * 5).toLocaleTimeString(),
      evaluation: { risk: 'LOW', level: 'READ', reason: 'Read project configuration' }
    },
    {
      id: 'log-2',
      actionType: 'WRITE',
      target: 'src/config/astraPersonality.ts',
      agentId: 'CodingAgent',
      status: 'AUTO_APPROVED',
      timestamp: new Date(Date.now() - 1000 * 60 * 12).toLocaleTimeString(),
      evaluation: { risk: 'MEDIUM', level: 'WRITE', reason: 'Updated persona directives' }
    },
    {
      id: 'log-3',
      actionType: 'EXECUTE',
      target: 'npm run lint',
      agentId: 'CodingAgent',
      status: 'AUTO_APPROVED',
      timestamp: new Date(Date.now() - 1000 * 60 * 18).toLocaleTimeString(),
      evaluation: { risk: 'HIGH', level: 'EXECUTE', reason: 'Ran oxlint static analysis' }
    }
  ]);

  const [pendingRequests, setPendingRequests] = useState<SecurityAuditEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchSecurityStatus = () => {
    setIsLoading(true);
    fetch('/api/v1/security/audit')
      .catch(() => fetch('http://localhost:8990/api/v1/security/audit'))
      .then(res => res && res.json ? res.json() : null)
      .then(data => {
        if (data?.logs?.length || data?.auditLogs?.length) setAuditLogs(data.logs || data.auditLogs);
        if (data?.pending || data?.pendingRequests) setPendingRequests(data.pending || data.pendingRequests);
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    fetchSecurityStatus();
  }, []);

  const handleApprove = async (id: string) => {
    try {
      await fetch('/api/v1/security/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      }).catch(() => fetch('http://localhost:8990/api/v1/security/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      }));
      fetchSecurityStatus();
    } catch {
      setPendingRequests(prev => prev.filter(r => r.id !== id));
    }
  };

  const handleReject = async (id: string) => {
    try {
      await fetch('/api/v1/security/reject', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      }).catch(() => fetch('http://localhost:8990/api/v1/security/reject', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      }));
      fetchSecurityStatus();
    } catch {
      setPendingRequests(prev => prev.filter(r => r.id !== id));
    }
  };

  return (
    <div className="w-full h-full flex flex-col p-6 space-y-6 overflow-y-auto">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-amber-500/20 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-amber-400" />
            <h1 className="text-xl font-bold text-white tracking-wide">ZERO-TRUST SECURITY CENTER</h1>
          </div>
          <p className="text-xs text-white/50 mt-1">
            Real-time permission evaluations, execution boundaries, and immutable audit trails.
          </p>
        </div>
        <button
          onClick={fetchSecurityStatus}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 text-xs font-mono transition-colors self-start md:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Permission Tiers Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 font-mono text-xs">
        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
          <div className="flex items-center justify-between">
            <span className="font-bold">LOW RISK</span>
            <CheckCircle className="w-4 h-4" />
          </div>
          <p className="text-[10px] text-white/60 mt-1">READ / SAFE_ACTION (Auto-approved)</p>
        </div>

        <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-400">
          <div className="flex items-center justify-between">
            <span className="font-bold">MEDIUM RISK</span>
            <Eye className="w-4 h-4" />
          </div>
          <p className="text-[10px] text-white/60 mt-1">WRITE / EDIT (Sandboxed & Logged)</p>
        </div>

        <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
          <div className="flex items-center justify-between">
            <span className="font-bold">HIGH RISK</span>
            <AlertTriangle className="w-4 h-4" />
          </div>
          <p className="text-[10px] text-white/60 mt-1">EXECUTE / DEPLOY (Approval Gated)</p>
        </div>

        <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400">
          <div className="flex items-center justify-between">
            <span className="font-bold">CRITICAL</span>
            <Lock className="w-4 h-4" />
          </div>
          <p className="text-[10px] text-white/60 mt-1">DELETE / PHYSICAL (Strict Interlock)</p>
        </div>
      </div>

      {/* Pending Approvals */}
      {pendingRequests.length > 0 && (
        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 space-y-3">
          <div className="flex items-center gap-2 text-amber-400 font-mono text-sm font-semibold">
            <AlertTriangle className="w-4 h-4" />
            <span>PENDING AUTHORIZATION REQUESTS ({pendingRequests.length})</span>
          </div>

          <div className="space-y-2">
            {pendingRequests.map(req => (
              <div key={req.id} className="p-3 rounded-lg bg-black/40 border border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono text-[10px]">
                      {req.actionType}
                    </span>
                    <span className="font-semibold text-white">{req.target}</span>
                  </div>
                  <p className="text-white/50 text-[11px] mt-1">
                    Requested by <span className="text-amber-400">{req.agentId}</span> — {req.evaluation?.reason}
                  </p>
                </div>

                <div className="flex items-center gap-2 font-mono">
                  <button
                    onClick={() => handleApprove(req.id)}
                    className="px-3 py-1 rounded bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 flex items-center gap-1 transition-colors"
                  >
                    <CheckCircle className="w-3.5 h-3.5" /> Approve
                  </button>
                  <button
                    onClick={() => handleReject(req.id)}
                    className="px-3 py-1 rounded bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 flex items-center gap-1 transition-colors"
                  >
                    <XCircle className="w-3.5 h-3.5" /> Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Audit Log Table */}
      <div className="space-y-3 flex-1 flex flex-col min-h-0">
        <div className="flex items-center justify-between font-mono text-xs text-white/70">
          <span className="font-semibold flex items-center gap-1.5">
            <Terminal className="w-4 h-4 text-amber-400" />
            SECURITY AUDIT LOGS
          </span>
          <span>{auditLogs.length} events recorded</span>
        </div>

        <div className="flex-1 bg-black/30 border border-white/10 rounded-xl overflow-hidden overflow-y-auto divide-y divide-white/5 font-mono text-xs">
          {auditLogs.map((log) => {
            const risk = log.evaluation?.risk || 'LOW';
            const riskColor = risk === 'CRITICAL' ? 'text-rose-400' : risk === 'HIGH' ? 'text-amber-400' : risk === 'MEDIUM' ? 'text-blue-400' : 'text-emerald-400';

            return (
              <motion.div
                key={log.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="p-3 hover:bg-white/5 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-2"
              >
                <div className="flex items-center gap-3">
                  <span className={`text-[10px] font-bold ${riskColor}`}>[{risk}]</span>
                  <span className="text-amber-400 font-semibold">{log.actionType}</span>
                  <span className="text-white/80 truncate max-w-md">{log.target}</span>
                </div>

                <div className="flex items-center gap-4 text-[11px] text-white/40">
                  <span className="text-white/60">{log.agentId}</span>
                  <span className="text-emerald-400/80">{log.status}</span>
                  <span>{log.timestamp}</span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
