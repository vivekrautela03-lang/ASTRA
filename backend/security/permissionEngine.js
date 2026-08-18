/**
 * ASTRA OS — Multi-Tier Permission Engine & Risk Evaluator
 */

export const PERMISSION_LEVELS = {
  READ: 'READ',
  SAFE_ACTION: 'SAFE_ACTION',
  WRITE: 'WRITE',
  EXECUTE: 'EXECUTE',
  DEPLOY: 'DEPLOY',
  DELETE: 'DELETE',
  COMMUNICATE: 'COMMUNICATE',
  FINANCIAL: 'FINANCIAL',
  PHYSICAL: 'PHYSICAL',
  ADMIN: 'ADMIN'
};

export const RISK_LEVELS = {
  LOW: 'LOW',
  MEDIUM: 'MEDIUM',
  HIGH: 'HIGH',
  CRITICAL: 'CRITICAL'
};

export class PermissionEngine {
  constructor() {
    this.pendingAuthorizations = new Map();
    this.auditLogs = [];
  }

  evaluateRisk(actionType, target = '', metadata = {}) {
    const act = (actionType || '').toUpperCase();
    const str = `${target} ${JSON.stringify(metadata)}`.toLowerCase();

    // Critical Risks
    if (act === PERMISSION_LEVELS.DELETE || act === PERMISSION_LEVELS.PHYSICAL || str.includes('rm -rf') || str.includes('format') || str.includes('drop table') || str.includes('del /f /s')) {
      return {
        level: PERMISSION_LEVELS.DELETE,
        risk: RISK_LEVELS.CRITICAL,
        requiresConfirmation: true,
        reason: 'Irreversible action or physical hardware actuator control.'
      };
    }

    // High Risks
    if (act === PERMISSION_LEVELS.DEPLOY || act === PERMISSION_LEVELS.EXECUTE || act === PERMISSION_LEVELS.FINANCIAL || str.includes('git push') || str.includes('npm publish') || str.includes('deploy')) {
      return {
        level: PERMISSION_LEVELS.DEPLOY,
        risk: RISK_LEVELS.HIGH,
        requiresConfirmation: true,
        reason: 'External production deployment or untrusted script execution.'
      };
    }

    // Medium Risks
    if (act === PERMISSION_LEVELS.WRITE || str.includes('write_file') || str.includes('git commit')) {
      return {
        level: PERMISSION_LEVELS.WRITE,
        risk: RISK_LEVELS.MEDIUM,
        requiresConfirmation: false,
        reason: 'Modifies workspace files or project records.'
      };
    }

    // Low Risks
    return {
      level: act === PERMISSION_LEVELS.SAFE_ACTION ? PERMISSION_LEVELS.SAFE_ACTION : PERMISSION_LEVELS.READ,
      risk: RISK_LEVELS.LOW,
      requiresConfirmation: false,
      reason: 'Read-only or safe local action.'
    };
  }

  requestApproval({ actionType, target, metadata = {}, agentId = 'ASTRA-Kernel', user = { id: 'usr-vivek-owner' } }) {
    const evaluation = this.evaluateRisk(actionType, target, metadata);
    const id = `auth-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

    const authRecord = {
      id,
      actionType,
      target,
      metadata,
      agentId,
      userId: user.id,
      evaluation,
      status: evaluation.requiresConfirmation ? 'PENDING' : 'AUTO_APPROVED',
      createdAt: new Date().toISOString()
    };

    if (evaluation.requiresConfirmation) {
      this.pendingAuthorizations.set(id, authRecord);
    }

    this.logAudit(authRecord);
    return authRecord;
  }

  approve(id, approvedBy = 'Vivek') {
    const record = this.pendingAuthorizations.get(id);
    if (!record) return { success: false, error: 'Approval request not found' };

    record.status = 'APPROVED';
    record.approvedBy = approvedBy;
    record.resolvedAt = new Date().toISOString();
    this.pendingAuthorizations.delete(id);
    this.logAudit(record);

    return { success: true, record };
  }

  reject(id, reason = 'User denied permission') {
    const record = this.pendingAuthorizations.get(id);
    if (!record) return { success: false, error: 'Approval request not found' };

    record.status = 'REJECTED';
    record.rejectReason = reason;
    record.resolvedAt = new Date().toISOString();
    this.pendingAuthorizations.delete(id);
    this.logAudit(record);

    return { success: true, record };
  }

  logAudit(record) {
    this.auditLogs.unshift({
      ...record,
      timestamp: new Date().toISOString()
    });
    if (this.auditLogs.length > 500) {
      this.auditLogs.pop();
    }
  }

  getAuditLogs() {
    return this.auditLogs;
  }

  getPendingRequests() {
    return Array.from(this.pendingAuthorizations.values());
  }
}

export const permissionEngine = new PermissionEngine();
