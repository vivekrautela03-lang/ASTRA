import { WebSocketServer, WebSocket } from 'ws';
import { getSystemMetrics } from '../utils/telemetry.js';
import { execCommand } from '../services/commandExecutor.js';

export function setupWebSocket(server) {
  const wss = new WebSocketServer({ server, path: '/ev-kernel' });

  wss.on('connection', (ws) => {
    console.log('[EV Backend] Client connected to Neural IPC Bridge.');

    ws.send(JSON.stringify({
      event: 'CONNECTED',
      message: 'EV AI Operating System IPC Bridge established.',
      metrics: getSystemMetrics()
    }));

    const telemetryInterval = setInterval(() => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({
          event: 'TELEMETRY_UPDATE',
          metrics: getSystemMetrics(),
          timestamp: Date.now()
        }));
      }
    }, 1000);

    ws.on('message', async (message) => {
      try {
        const data = JSON.parse(message.toString());

        if (data.action === 'EXECUTE' && data.command) {
          const result = await execCommand(data.command);
          ws.send(JSON.stringify({
            event: 'EXECUTION_RESULT',
            id: data.id,
            output: result.stdout || result.error || 'Done'
          }));
        }
      } catch (error) {
        console.error('[EV Backend] Error parsing WS message', error);
      }
    });

    ws.on('close', () => {
      clearInterval(telemetryInterval);
      console.log('[EV Backend] Client disconnected.');
    });
  });

  return wss;
}
