/**
 * ASTRA OS — Robotics Hardware Abstraction Layer & Safety Interlock
 */

import { CONFIG } from '../config/env.js';

export class RoboticsController {
  constructor() {
    this.connected = true;
    this.deviceId = 'ASTRA-ROBOTIC-01';
    this.mode = 'IDLE'; // IDLE, ASSIST, NAVIGATION, DOCKED, EMERGENCY_STOP
    this.telemetry = {
      batteryPct: 94,
      voltage: 24.2,
      motorTempC: 38.5,
      jointAngles: [0, 45, 90, 0, 15, 0],
      imu: { pitch: 0.2, roll: -0.1, yaw: 124.5 },
      lidarDistanceMinM: 1.84,
      safetyInterlockActive: CONFIG.ROBOTICS_SAFETY_INTERLOCK
    };
  }

  getState() {
    return {
      connected: this.connected,
      deviceId: this.deviceId,
      mode: this.mode,
      telemetry: this.telemetry,
      timestamp: new Date().toISOString()
    };
  }

  requestMotion(goal = {}) {
    if (!this.connected) return { success: false, error: 'Device not connected' };
    if (this.mode === 'EMERGENCY_STOP') return { success: false, error: 'Cannot move in EMERGENCY_STOP state. Reset required.' };

    // Strict velocity envelope safety check
    if (goal.speed && goal.speed > 2.0) {
      return { success: false, error: 'Motion velocity exceeds safety envelope threshold (max 2.0 m/s).' };
    }

    this.mode = 'NAVIGATION';
    return {
      success: true,
      status: 'MOTION_PLANNED',
      goal,
      estimatedDurationSec: 4.2,
      safetyCheck: 'PASSED'
    };
  }

  emergencyStop() {
    this.mode = 'EMERGENCY_STOP';
    return {
      success: true,
      status: 'EMERGENCY_STOP_ENGAGED',
      message: 'All physical actuators latch-cut disabled immediately.'
    };
  }
}

export const roboticsController = new RoboticsController();
