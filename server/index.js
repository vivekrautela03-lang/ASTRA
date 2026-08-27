import '../backend/config/env.js';
import express from 'express';
import http from 'http';
import cors from 'cors';
import { spawn } from 'child_process';
import path from 'path';
import systemRoutes from './routes/system.js';
import automationRoutes from './routes/automation.js';
import astraCoreRoutes from './routes/astraCore.js';
import integrationRoutes from './routes/integrations.js';
import deviceRoutes from './routes/devices.js';
import pythonToolsRoutes from './routes/pythonTools.js';
import { setupWebSocket } from './ws/bridge.js';
import { gatewayRouter } from '../backend/core/gateway.js';

const app = express();
const PORT = process.env.PORT || 8990;

app.use(cors());
app.use(express.json({ limit: '25mb' }));

// Full API Gateway v1 Pipeline
app.use('/api/v1', gatewayRouter);

// Health Endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ONLINE',
    version: '10.0-ultra',
    timestamp: new Date().toISOString()
  });
});

// Mounted Routes
app.use('/api', systemRoutes);
app.use('/api', automationRoutes);
app.use('/api', astraCoreRoutes);
app.use('/api', integrationRoutes);
app.use('/api', deviceRoutes);
app.use('/api/tools', pythonToolsRoutes);

// Serve production built UI
const distPath = path.resolve(process.cwd(), 'dist');
app.use(express.static(distPath));

app.get('/api', (req, res) => {
  res.json({
    system: 'ASTRA Production AI Operating System Kernel',
    version: '10.0-ultra',
    status: 'ONLINE',
    port: PORT,
    endpoints: {
      health: `http://localhost:${PORT}/api/health`,
      status: `http://localhost:${PORT}/api/astra/status`,
      tools: `http://localhost:${PORT}/api/tools/execute`,
      models: `http://localhost:${PORT}/api/settings/models`,
      integrations: `http://localhost:${PORT}/api/integrations`,
      devices: `http://localhost:${PORT}/api/devices`,
      wsBridge: `ws://localhost:${PORT}/ev-kernel`
    }
  });
});

app.get('*', (req, res) => {
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ error: 'Endpoint not found' });
  }
  res.sendFile(path.join(distPath, 'index.html'));
});

// Ensure Python Bridge is running
function startPythonBridge() {
  fetch('http://127.0.0.1:8991/health')
    .then(() => console.log('🐍 [PYTHON BRIDGE]: Already active on port 8991.'))
    .catch(() => {
      console.log('🐍 [PYTHON BRIDGE]: Spawning Python Tool Kernel on port 8991...');
      const pyProc = spawn('python', ['server/pythonBridge.py', '8991'], {
        stdio: 'inherit',
        shell: true
      });
      pyProc.on('error', (err) => console.error('[PYTHON BRIDGE SPAWN ERROR]:', err.message));
    });
}

startPythonBridge();

const server = http.createServer(app);
setupWebSocket(server);

server.listen(PORT, () => {
  console.log('\n=================================================');
  console.log(` ⚡ ASTRA AI OPERATING SYSTEM KERNEL v10.0-ULTRA ONLINE`);
  console.log(` 🌐 REST API Gateway:  http://localhost:${PORT}/api/astra/status`);
  console.log(` 🐍 Python Tools API:  http://localhost:${PORT}/api/tools/execute`);
  console.log(` 🔌 WebSocket Bridge:  ws://localhost:${PORT}/ev-kernel`);
  console.log(` 🛡️  Zero-Trust Sandbox & Permission Interlock: ACTIVE`);
  console.log('=================================================\n');
});
