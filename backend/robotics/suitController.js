/**
 * ASTRA OS — Wearable Suit & Telemetry Controller
 */

export class SuitController {
  constructor() {
    this.state = {
      suitId: 'ASTRA-EXO-MARK-I',
      connected: true,
      helmetHudOnline: true,
      mode: 'NORMAL',
      power: {
        batteryPct: 88,
        voltage: 48.4,
        drawWatts: 145.2,
        estimatedMinutes: 240
      },
      thermal: {
        coreTempC: 36.8,
        exhaustTempC: 41.2,
        zones: [
          { name: 'Helmet', tempC: 34.0, status: 'NOMINAL' },
          { name: 'Torso', tempC: 37.1, status: 'NOMINAL' },
          { name: 'Arms', tempC: 35.6, status: 'NOMINAL' },
          { name: 'Legs', tempC: 38.2, status: 'NOMINAL' }
        ]
      },
      balance: {
        pitch: 0.1,
        roll: 0.0,
        stabilityScore: 0.99,
        assistTorqueNm: 12.4
      },
      climbingModule: {
        enabled: false,
        adhesionState: 'DISENGAGED',
        surfaceType: 'UNKNOWN',
        maxSafeLoadKg: 110
      }
    };
  }

  getStatus() {
    return {
      ...this.state,
      timestamp: new Date().toISOString()
    };
  }

  setMode(mode) {
    const valid = ['NORMAL', 'ASSIST', 'SPORT', 'SILENT', 'EMERGENCY'];
    if (!valid.includes(mode)) return { success: false, error: 'Invalid mode' };
    this.state.mode = mode;
    return { success: true, mode: this.state.mode };
  }
}

export const suitController = new SuitController();
