import express from 'express';

const router = express.Router();
const PYTHON_BRIDGE_URL = 'http://127.0.0.1:8991';

// Execute any tool via Native Python Kernel
router.post('/execute', async (req, res) => {
  const { tool, args } = req.body;
  try {
    const response = await fetch(`${PYTHON_BRIDGE_URL}/execute`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tool, args: args || {} })
    });
    const data = await response.json();
    return res.json(data);
  } catch (err) {
    console.error(`[TOOL EXECUTE ERROR]: ${tool}:`, err.message);
    return res.status(500).json({
      success: false,
      error: `Python backend bridge error: ${err.message}`
    });
  }
});

// Specific action shortcuts
router.post('/open-app', async (req, res) => {
  const { app_name } = req.body;
  try {
    const response = await fetch(`${PYTHON_BRIDGE_URL}/execute`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tool: 'open_app', args: { app_name } })
    });
    const data = await response.json();
    return res.json(data);
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

router.get('/system-status', async (req, res) => {
  try {
    const response = await fetch(`${PYTHON_BRIDGE_URL}/system/status`);
    const data = await response.json();
    return res.json(data);
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
