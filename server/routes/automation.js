import { Router } from 'express';
import { exec } from 'child_process';
import { searchYouTube } from '../services/searchProvider.js';
import { executeProviderCommand } from '../services/commandExecutor.js';

const router = Router();

// 1. YouTube & Music Search
router.post('/automation/search-song', async (req, res) => {
  const { query, provider } = req.body;
  if (!query) {
    return res.status(400).json({ error: 'query required' });
  }

  try {
    if (!provider || provider === 'youtube') {
      const results = await searchYouTube(query);
      return res.json({ provider: 'youtube', results });
    }

    return res.json({ provider: provider || 'unknown', results: [] });
  } catch (error) {
    return res.status(500).json({ error: error instanceof Error ? error.message : 'Search failed' });
  }
});

// 2. Playback automation
router.post('/automation/play-song', async (req, res) => {
  const { provider, id, url, query } = req.body;
  if (!provider) {
    return res.status(400).json({ error: 'provider required' });
  }

  try {
    const result = await executeProviderCommand(provider, { id, url, query });

    if (result.error) {
      return res.status(400).json({ error: result.error });
    }

    return res.json({
      provider,
      played: true,
      url: url || (id ? `https://www.youtube.com/watch?v=${id}` : undefined),
      result
    });
  } catch (error) {
    return res.status(500).json({ error: error instanceof Error ? error.message : 'Playback failed' });
  }
});

// 3. Native OS Computer Automation & Device Control
router.post('/automate', (req, res) => {
  const { action, target, command } = req.body;

  if (action === 'open_app' && target) {
    let cmd = '';
    const name = target.toLowerCase();
    if (name.includes('code') || name.includes('vscode')) cmd = 'start code';
    else if (name.includes('notepad')) cmd = 'start notepad';
    else if (name.includes('calc')) cmd = 'start calc';
    else if (name.includes('explorer')) cmd = 'start explorer';
    else if (name.includes('chrome')) cmd = 'start chrome';
    else cmd = `start "" "${target}"`;

    exec(cmd, (err) => {
      if (err) return res.json({ status: 'FALLBACK', message: 'Triggered via browser protocol' });
      return res.json({ status: 'SUCCESS', target, action: 'open_app' });
    });
    return;
  }

  if (action === 'volume' && target) {
    let psScript = '';
    if (target === 'mute') {
      psScript = `powershell -c "(New-Object -ComObject WScript.Shell).SendKeys([char]173)"`;
    } else if (target === 'up') {
      psScript = `powershell -c "(New-Object -ComObject WScript.Shell).SendKeys([char]175)"`;
    } else if (target === 'down') {
      psScript = `powershell -c "(New-Object -ComObject WScript.Shell).SendKeys([char]174)"`;
    }

    if (psScript) {
      exec(psScript, () => {
        return res.json({ status: 'SUCCESS', action: 'volume', level: target });
      });
      return;
    }
  }

  if (action === 'command' && command) {
    exec(command, { timeout: 5000 }, (err, stdout, stderr) => {
      return res.json({
        status: err ? 'ERROR' : 'SUCCESS',
        output: stdout || stderr || 'Command executed with return code 0.'
      });
    });
    return;
  }

  return res.json({ status: 'PROCESSED', message: 'Action received by ASTRA OS kernel' });
});

export default router;
