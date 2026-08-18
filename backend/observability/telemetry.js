/**
 * ASTRA OS — Observability, Metrics & Cost Tracker
 */

import os from 'os';

export class TelemetryService {
  constructor() {
    this.metrics = {
      totalRequests: 0,
      totalTokens: 0,
      estimatedCostUsd: 0.0,
      errorCount: 0
    };
  }

  recordRequest({ tokens = 0, cost = 0, success = true }) {
    this.metrics.totalRequests += 1;
    this.metrics.totalTokens += tokens;
    this.metrics.estimatedCostUsd += cost;
    if (!success) this.metrics.errorCount += 1;
  }

  getHealth() {
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const memUsagePct = (((totalMem - freeMem) / totalMem) * 100).toFixed(1);

    return {
      status: 'HEALTHY',
      version: '10.0-ultra',
      uptimeSec: Math.floor(process.uptime()),
      system: {
        platform: os.platform(),
        cpus: os.cpus().length,
        memoryUsagePct: Number(memUsagePct),
        totalMemoryGb: (totalMem / (1024 ** 3)).toFixed(1),
        freeMemoryGb: (freeMem / (1024 ** 3)).toFixed(1)
      },
      metrics: this.metrics,
      timestamp: new Date().toISOString()
    };
  }
}

export const telemetryService = new TelemetryService();
