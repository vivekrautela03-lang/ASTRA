import express from 'express';
import http from 'http';
import cors from 'cors';
import systemRoutes from './routes/system.js';
import automationRoutes from './routes/automation.js';
import { setupWebSocket } from './ws/bridge.js';

const app = express();
const PORT = process.env.PORT || 8990;

app.use(cors());
app.use(express.json());
app.use('/api', systemRoutes);
app.use('/api', automationRoutes);

app.get('/', (req, res) => {
  res.send('EV AI Operating System Backend Kernel');
});

const server = http.createServer(app);
setupWebSocket(server);

server.listen(PORT, () => {
  console.log('\n=================================================');
  console.log(` EV AI Operating System Kernel active on port ${PORT}`);
  console.log(` REST API: http://localhost:${PORT}/api/health`);
  console.log(` WebSocket Bridge: ws://localhost:${PORT}/ev-kernel`);
  console.log('=================================================\n');
});
