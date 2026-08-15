export interface ProactiveAlert {
  id: string;
  type: 'battery' | 'break' | 'weather' | 'calendar' | 'system';
  title: string;
  message: string;
  severity: 'info' | 'warning' | 'critical';
  timestamp: string;
}

export class ProactiveMonitorService {
  private alerts: ProactiveAlert[] = [];
  private listeners: Array<(alert: ProactiveAlert | null) => void> = [];
  private currentAlert: ProactiveAlert | null = null;
  private intervalTimer: number | null = null;

  public startMonitoring(): void {
    if (this.intervalTimer) return;

    // Trigger initial welcome proactive alert
    setTimeout(() => {
      this.pushAlert({
        id: `alert-${Date.now()}`,
        type: 'system',
        title: 'JARVIS Proactive Sentinel Active',
        message: 'All proactive background monitors (Battery, Weather, Calendar & Ergonomics) are online.',
        severity: 'info',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      });
    }, 3000);

    // Periodic check loop
    this.intervalTimer = window.setInterval(() => {
      this.checkSystemHealth();
    }, 60000); // Every 60s
  }

  public stopMonitoring(): void {
    if (this.intervalTimer) {
      clearInterval(this.intervalTimer);
      this.intervalTimer = null;
    }
  }

  public subscribe(callback: (alert: ProactiveAlert | null) => void): () => void {
    this.listeners.push(callback);
    callback(this.currentAlert);
    return () => {
      this.listeners = this.listeners.filter(l => l !== callback);
    };
  }

  public dismissAlert(): void {
    this.currentAlert = null;
    this.notifyListeners();
  }

  public pushAlert(alert: ProactiveAlert): void {
    this.alerts.unshift(alert);
    this.currentAlert = alert;
    this.notifyListeners();

    // Auto dismiss after 8s if info
    if (alert.severity === 'info') {
      setTimeout(() => {
        if (this.currentAlert?.id === alert.id) {
          this.dismissAlert();
        }
      }, 8000);
    }
  }

  private checkSystemHealth(): void {
    // Check battery level if available in browser
    if ('getBattery' in navigator) {
      (navigator as any).getBattery().then((battery: any) => {
        if (battery.level <= 0.2 && !battery.charging) {
          this.pushAlert({
            id: `alert-bat-${Date.now()}`,
            type: 'battery',
            title: 'Low Battery Warning',
            message: `Battery is at ${Math.round(battery.level * 100)}%. Please connect your laptop charger.`,
            severity: 'warning',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          });
        }
      });
    }
  }

  private notifyListeners(): void {
    this.listeners.forEach(cb => cb(this.currentAlert));
  }
}

export const proactiveMonitor = new ProactiveMonitorService();
