import { Router } from 'express';
import { getSystemMetrics } from '../utils/telemetry.js';
import { execCommand } from '../services/commandExecutor.js';

const router = Router();

router.get('/health', (req, res) => {
  res.json({
    status: 'ONLINE',
    system: 'EV AI Operating System',
    metrics: getSystemMetrics(),
    timestamp: new Date().toISOString()
  });
});

router.post('/execute-cmd', async (req, res) => {
  const { command } = req.body;
  if (!command) {
    return res.status(400).json({ error: 'Command parameter required' });
  }

  try {
    const result = await execCommand(command, { timeout: 5000 });
    return res.json({
      command,
      stdout: result.stdout || '',
      stderr: result.stderr || '',
      error: result.error,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return res.status(500).json({ error: error instanceof Error ? error.message : 'Execution failed' });
  }
});

export default router;
