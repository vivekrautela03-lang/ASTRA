/**
 * ASTRA OS — Robotics Hardware Abstraction Layer & Safety Gate
 */

export class RoboticsController {
  constructor() {
    this.connected = true; // Virtual hardware link
    this.deviceId = 'ASTRA-ROBOTIC-01';
    this.mode = 'IDLE'; // IDLE, ASSIST, NAVIGATION, DOCKED, EMERGENCY_STOP
    this.telemetry = {
      batteryPct: 94,
      voltage: 24.2,
      motorTempC: 38.5,
      jointAngles: [0, 45, 90, 0, 15, 0],
      imu: { pitch: 0.2, roll: -0.1, yaw: 124.5 },
      lidarDistanceMinM: 1.84,
      safetyInterlockActive: true,
      lastEStop: null
    };
  }

  connect(deviceId = 'ASTRA-ROBOTIC-01') {
    this.deviceId = deviceId;
    this.connected = true;
    this.mode = 'IDLE';
    return { success: true, message: `Connected to device ${deviceId}`, telemetry: this.telemetry };
  }

  disconnect() {
    this.connected = false;
    this.mode = 'DISCONNECTED';
    return { success: true, message: 'Device disconnected' };
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

  setMode(mode) {
    const validModes = ['IDLE', 'ASSIST', 'NAVIGATION', 'DOCKED', 'EMERGENCY_STOP'];
    if (!validModes.includes(mode)) {
      return { success: false, error: `Invalid mode. Must be one of: ${validModes.join(', ')}` };
    }
    this.mode = mode;
    return { success: true, mode: this.mode };
  }

  requestMotion(goal) {
    if (!this.connected) return { success: false, error: 'Device not connected' };
    if (this.mode === 'EMERGENCY_STOP') return { success: false, error: 'Cannot move in EMERGENCY_STOP state. Reset required.' };

    // Safety constraint: Validate kinematic parameters
    if (typeof goal === 'object' && goal.speed && goal.speed > 2.0) {
      return { success: false, error: 'Motion velocity exceeds safety speed envelope limit (max 2.0 m/s).' };
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
    this.telemetry.lastEStop = new Date().toISOString();
    return {
      success: true,
      status: 'EMERGENCY_STOP_ENGAGED',
      message: 'All physical actuators latch-cut disabled immediately.'
    };
  }
}

export const roboticsController = new RoboticsController();
