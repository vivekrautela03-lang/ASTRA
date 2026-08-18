/**
 * ASTRA OS — Native Host Computer Controller & Desktop Automation
 */

import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';

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

export class ComputerController {
  static openApplication(appName) {
    return new Promise((resolve) => {
      const name = (appName || '').toLowerCase().trim();
      const cmd = APP_MAP[name] || `start "" "${appName}"`;

      exec(cmd, (err) => {
        if (err) {
          exec(`powershell -c "Start-Process '${appName}'"`, (psErr) => {
            if (psErr) return resolve({ success: false, error: `Could not launch application ${appName}` });
            return resolve({ success: true, app: appName, status: 'LAUNCHED_FALLBACK' });
          });
          return;
        }
        resolve({ success: true, app: appName, status: 'LAUNCHED' });
      });
    });
  }

  static readFile(filePath) {
    try {
      const resolved = path.resolve(filePath);
      if (fs.existsSync(resolved)) {
        const content = fs.readFileSync(resolved, 'utf8');
        return { success: true, filePath: resolved, content };
      }
      return { success: false, error: `File not found at ${filePath}` };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }

  static writeFile(filePath, content) {
    try {
      const resolved = path.resolve(filePath);
      const dir = path.dirname(resolved);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(resolved, content || '', 'utf8');
      return { success: true, filePath: resolved, bytesWritten: (content || '').length };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }

  static typeTextIntoActiveWindow(text) {
    return new Promise((resolve) => {
      const escaped = (text || '').replace(/'/g, "''").replace(/"/g, '`"');
      const psScript = `powershell -c "Set-Clipboard -Value '${escaped}'; Start-Sleep -Milliseconds 150; (New-Object -ComObject WScript.Shell).SendKeys('^v')"`;
      exec(psScript, (err) => {
        if (err) return resolve({ success: false, error: 'Could not paste to active window' });
        resolve({ success: true, message: 'Text written to active window' });
      });
    });
  }

  static adjustVolume(level) {
    return new Promise((resolve) => {
      let psScript = '';
      if (level === 'mute') psScript = `powershell -c "(New-Object -ComObject WScript.Shell).SendKeys([char]173)"`;
      else if (level === 'up') psScript = `powershell -c "(New-Object -ComObject WScript.Shell).SendKeys([char]175)"`;
      else if (level === 'down') psScript = `powershell -c "(New-Object -ComObject WScript.Shell).SendKeys([char]174)"`;

      if (!psScript) return resolve({ success: false, error: 'Invalid volume command' });

      exec(psScript, (err) => {
        if (err) return resolve({ success: false, error: err.message });
        resolve({ success: true, action: 'VOLUME_ADJUSTED', level });
      });
    });
  }

  static openUrl(url) {
    return new Promise((resolve) => {
      const safeUrl = String(url).replace(/"/g, '\\"');
      const cmd = process.platform === 'win32' ? `start "" "${safeUrl}"` : `xdg-open "${safeUrl}"`;
      exec(cmd, (err) => {
        if (err) return resolve({ success: false, error: err.message });
        resolve({ success: true, url });
      });
    });
  }
}
