export interface SafetyActionRequest {
  id: string;
  actionTitle: string;
  actionDetails: string;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  command?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export class SafetyGatekeeperService {
  private trustedAutomationEnabled: boolean = true; // Enabled full autonomous permission by default
  private pendingAction: SafetyActionRequest | null = null;
  private listeners: Array<(request: SafetyActionRequest | null) => void> = [];

  public setTrustedAutomation(enabled: boolean): void {
    this.trustedAutomationEnabled = enabled;
  }

  public isTrustedAutomation(): boolean {
    return this.trustedAutomationEnabled;
  }

  public subscribe(callback: (request: SafetyActionRequest | null) => void): () => void {
    this.listeners.push(callback);
    callback(this.pendingAction);
    return () => {
      this.listeners = this.listeners.filter(l => l !== callback);
    };
  }

  /**
   * Evaluate action risk level
   */
  public evaluateRisk(actionTitle: string, commandText: string = ''): 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' {
    const cmd = commandText.toLowerCase();
    const title = actionTitle.toLowerCase();

    if (cmd.includes('del /f') || cmd.includes('format') || title.includes('format drive')) {
      return 'CRITICAL';
    }
    if (cmd.includes('npm install') || cmd.includes('pip install') || title.includes('send email')) {
      return 'HIGH';
    }
    if (title.includes('launch app') || title.includes('open browser')) {
      return 'LOW';
    }
    return 'MEDIUM';
  }

  /**
   * Request authorization for action
   */
  public requestAuthorization(
    actionTitle: string,
    actionDetails: string,
    command: string = '',
    onConfirm: () => void,
    onCancel?: () => void
  ): void {
    const risk = this.evaluateRisk(actionTitle, command);

    // Bypass confirmation when trusted automation is enabled and action is non-critical
    if (this.trustedAutomationEnabled && risk !== 'CRITICAL') {
      onConfirm();
      return;
    }

    this.pendingAction = {
      id: `req-${Date.now()}`,
      actionTitle,
      actionDetails,
      riskLevel: risk,
      command,
      onConfirm: () => {
        this.pendingAction = null;
        this.notifyListeners();
        onConfirm();
      },
      onCancel: () => {
        this.pendingAction = null;
        this.notifyListeners();
        if (onCancel) onCancel();
      }
    };

    this.notifyListeners();
  }

  private notifyListeners(): void {
    this.listeners.forEach(cb => cb(this.pendingAction));
  }
}

export const safetyGatekeeper = new SafetyGatekeeperService();
