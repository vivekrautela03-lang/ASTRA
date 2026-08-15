import type { SystemTelemetryData } from '../types/eva';

export class SystemTelemetryService {
  private currentData: SystemTelemetryData = {
    cpuUsage: 14,
    gpuUsage: 28,
    ramUsage: 42,
    ramTotalGB: 32,
    ramUsedGB: 13.4,
    gpuTemp: 46,
    vramUsedGB: 5.2,
    networkDownMbps: 450.8,
    networkUpMbps: 120.4,
    batteryLevel: 98,
    isCharging: true,
    activeProcessesCount: 247,
    systemLatencyMs: 4.2,
    fps: 120
  };

  private listeners: Array<(data: SystemTelemetryData) => void> = [];
  private timer: number | null = null;

  public startTelemetryStream(intervalMs: number = 1000): void {
    if (this.timer) return;
    
    this.timer = window.setInterval(() => {
      // Simulate micro fluctuations in real system load
      this.currentData = {
        ...this.currentData,
        cpuUsage: Math.min(99, Math.max(5, Math.round(this.currentData.cpuUsage + (Math.random() * 8 - 4)))),
        gpuUsage: Math.min(99, Math.max(10, Math.round(this.currentData.gpuUsage + (Math.random() * 12 - 6)))),
        ramUsage: Math.min(95, Math.max(30, Math.round(this.currentData.ramUsage + (Math.random() * 2 - 1)))),
        ramUsedGB: Number((13.4 + (Math.random() * 0.4 - 0.2)).toFixed(1)),
        gpuTemp: Math.min(85, Math.max(38, Math.round(this.currentData.gpuTemp + (Math.random() * 2 - 1)))),
        networkDownMbps: Number((450 + (Math.random() * 80 - 40)).toFixed(1)),
        networkUpMbps: Number((120 + (Math.random() * 20 - 10)).toFixed(1)),
        systemLatencyMs: Number((4 + Math.random() * 1.5).toFixed(1)),
        fps: Math.round(115 + Math.random() * 10)
      };

      this.notifyListeners();
    }, intervalMs);
  }

  public stopTelemetryStream(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  public subscribe(callback: (data: SystemTelemetryData) => void): () => void {
    this.listeners.push(callback);
    callback(this.currentData);
    return () => {
      this.listeners = this.listeners.filter(l => l !== callback);
    };
  }

  private notifyListeners(): void {
    this.listeners.forEach(cb => cb(this.currentData));
  }

  public getCurrentTelemetry(): SystemTelemetryData {
    return this.currentData;
  }
}

export const systemTelemetry = new SystemTelemetryService();
