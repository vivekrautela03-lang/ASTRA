import os from 'os';

export function getSystemMetrics() {
  const cpus = os.cpus();
  const totalMem = os.totalmem();
  const freeMem = os.freemem();
  const usedMem = totalMem - freeMem;

  return {
    cpuCount: cpus.length,
    cpuModel: cpus[0]?.model || 'Generic x86_64',
    ramTotalGB: (totalMem / 1073741824).toFixed(1),
    ramUsedGB: (usedMem / 1073741824).toFixed(1),
    ramUsagePercent: Math.round((usedMem / totalMem) * 100),
    uptimeSec: Math.round(os.uptime()),
    platform: os.platform(),
    arch: os.arch()
  };
}
