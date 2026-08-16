import { Router } from 'express';
import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';
import { searchYouTube } from '../services/searchProvider.js';
import { executeProviderCommand } from '../services/commandExecutor.js';

const router = Router();

// App mapping dictionary for Windows PC
const APP_MAP = {
  notepad: 'start notepad',
  code: 'start code',
  vscode: 'start code',
  calc: 'start calc',
  calculator: 'start calc',
  explorer: 'start explorer',
  chrome: 'start chrome',
  edge: 'start msedge',
  brave: 'start brave',
  firefox: 'start firefox',
  spotify: 'start spotify',
  discord: 'start discord',
  slack: 'start slack',
  word: 'start winword',
  excel: 'start excel',
  powerpoint: 'start powerpnt',
  paint: 'start mspaint',
  terminal: 'start wt',
  cmd: 'start cmd',
  powershell: 'start powershell',
  taskmgr: 'start taskmgr',
  settings: 'start ms-settings:',
  vlc: 'start vlc',
  steam: 'start steam'
};

// 1. YouTube & Music Search
router.post('/automation/search-song', async (req, res) => {
  const { query, provider } = req.body;
  if (!query) return res.status(400).json({ error: 'query required' });

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
  if (!provider) return res.status(400).json({ error: 'provider required' });

  try {
    const result = await executeProviderCommand(provider, { id, url, query });
    if (result.error) return res.status(400).json({ error: result.error });

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

// 3. Comprehensive Native OS Computer Automation (Search, Play, Open, Read, Write)
router.post('/automate', (req, res) => {
  const { action, target, command, filePath, content } = req.body;

  // A. Open any Application on Computer
  if (action === 'open_app' && target) {
    const name = target.toLowerCase().trim();
    let cmd = APP_MAP[name] || `start "" "${target}"`;

    exec(cmd, (err) => {
      if (err) {
        // Try direct PowerShell start-process fallback
        exec(`powershell -c "Start-Process '${target}'"`, (psErr) => {
          if (psErr) return res.json({ status: 'FALLBACK', message: `Could not launch ${target} directly.` });
          return res.json({ status: 'SUCCESS', target, action: 'open_app' });
        });
        return;
      }
      return res.json({ status: 'SUCCESS', target, action: 'open_app' });
    });
    return;
  }

  // B. Read File Content on Computer
  if (action === 'read_file' && filePath) {
    try {
      const resolvedPath = path.resolve(filePath);
      if (fs.existsSync(resolvedPath)) {
        const fileData = fs.readFileSync(resolvedPath, 'utf8');
        return res.json({ status: 'SUCCESS', filePath: resolvedPath, content: fileData });
      } else {
        return res.status(404).json({ status: 'ERROR', message: `File not found at ${filePath}` });
      }
    } catch (err) {
      return res.status(500).json({ status: 'ERROR', message: err.message });
    }
  }

  // C. Write Content to File on Computer
  if (action === 'write_file' && filePath) {
    try {
      const resolvedPath = path.resolve(filePath);
      const dir = path.dirname(resolvedPath);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(resolvedPath, content || '', 'utf8');
      return res.json({ status: 'SUCCESS', filePath: resolvedPath, bytesWritten: (content || '').length });
    } catch (err) {
      return res.status(500).json({ status: 'ERROR', message: err.message });
    }
  }

  // D. Type / Write Text into Active App Window (Keystroke Injection & Clipboard Paste)
  if (action === 'type_text' && content) {
    // Write to clipboard and simulate Ctrl+V
    const escapedText = content.replace(/'/g, "''").replace(/"/g, '`"');
    const psScript = `powershell -c "Set-Clipboard -Value '${escapedText}'; Start-Sleep -Milliseconds 150; (New-Object -ComObject WScript.Shell).SendKeys('^v')"`;

    exec(psScript, (err) => {
      if (err) return res.json({ status: 'ERROR', message: 'Could not paste to active window' });
      return res.json({ status: 'SUCCESS', action: 'type_text', message: 'Text written to active window' });
    });
    return;
  }

  // E. System Audio & Volume
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

  // F. Execute Shell Command
  if (action === 'command' && command) {
    exec(command, { timeout: 10000 }, (err, stdout, stderr) => {
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
