import { Router } from 'express';
import { roboticsController } from '../services/robotics/roboticsController.js';
import { suitController } from '../services/robotics/suitController.js';
import { digitalTwin } from '../services/robotics/digitalTwin.js';

const router = Router();

const REGISTERED_DEVICES = [
  {
    id: 'dev-desktop-01',
    name: 'Primary Workstation Host',
    type: 'Desktop',
    connection: 'Direct IPC / Loopback',
    status: 'ONLINE',
    safetyLevel: 'SAFE'
  },
  {
    id: 'dev-mobile-01',
    name: 'Astra Android Mobile Node',
    type: 'Mobile',
    connection: 'WebSocket TLS',
    status: 'PAIRED',
    safetyLevel: 'SAFE'
  },
  {
    id: 'dev-robotic-01',
    name: 'ASTRA Autonomous Robotic Unit',
    type: 'Robotics',
    connection: 'Telemetry Interlock Bridge',
    status: 'ONLINE',
    safetyLevel: 'INTERLOCKED'
  },
  {
    id: 'dev-suit-01',
    name: 'ASTRA Wearable Exoskeleton Mark-I',
    type: 'Wearable Suit',
    connection: 'IMU Mesh Telemetry',
    status: 'ONLINE',
    safetyLevel: 'NOMINAL'
  }
];

router.get('/devices', (req, res) => {
  res.json({
    devices: REGISTERED_DEVICES,
    roboticsState: roboticsController.getState(),
    suitState: suitController.getStatus(),
    digitalTwin: digitalTwin.getSimulationStatus()
  });
});

router.post('/devices/pair', (req, res) => {
  const { name, type } = req.body;
  const newDev = {
    id: `dev-${Date.now()}`,
    name: name || 'Remote Astra Node',
    type: type || 'Mobile',
    connection: 'WebSocket TLS',
    status: 'PAIRED',
    safetyLevel: 'SAFE'
  };
  REGISTERED_DEVICES.push(newDev);
  res.json({ success: true, device: newDev });
});

router.post('/devices/:id/command', (req, res) => {
  const { command, payload } = req.body;
  const { id } = req.params;

  if (id === 'dev-robotic-01' || command === 'motion') {
    const result = roboticsController.requestMotion(payload || {});
    return res.json(result);
  }

  if (command === 'estop') {
    const result = roboticsController.emergencyStop();
    return res.json(result);
  }

  if (id === 'dev-suit-01' || command === 'suit_mode') {
    const result = suitController.setMode(payload?.mode || 'NORMAL');
    return res.json(result);
  }

  res.json({ success: true, message: `Command "${command}" processed for device ${id}` });
});

export default router;
