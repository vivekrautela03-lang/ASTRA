/**
 * ASTRA OS — Device Manager & Cross-Device Synchronizer
 */

export class DeviceManager {
  constructor() {
    this.devices = new Map();
    this.initDefaultDevices();
  }

  initDefaultDevices() {
    this.registerDevice({
      id: 'dev-desktop-host',
      name: 'Primary Neural Workstation',
      type: 'Desktop',
      os: 'Windows 11 x64',
      status: 'ONLINE',
      capabilities: ['VOICE', 'VISION', 'COMPUTE', 'SANDBOX', 'LOCAL_STORAGE'],
      safetyLevel: 'SAFE'
    });

    this.registerDevice({
      id: 'dev-android-mobile',
      name: 'Astra Mobile Companion',
      type: 'Android',
      os: 'Android 14',
      status: 'CONNECTED',
      capabilities: ['VOICE', 'CAMERA', 'NOTIFICATIONS', 'GPS'],
      safetyLevel: 'SAFE'
    });

    this.registerDevice({
      id: 'dev-robotics-arm',
      name: '6-DOF Precision Kinematics Node',
      type: 'Robotics',
      os: 'RTOS / Embedded',
      status: 'IDLE',
      capabilities: ['SPATIAL_MAPPING', 'KINEMATICS', 'E_STOP'],
      safetyLevel: 'PHYSICAL_GATED'
    });
  }

  registerDevice(device) {
    this.devices.set(device.id, {
      ...device,
      lastSeen: new Date().toISOString()
    });
    return device;
  }

  listDevices() {
    return Array.from(this.devices.values());
  }

  getDevice(id) {
    return this.devices.get(id);
  }
}

export const deviceManager = new DeviceManager();
