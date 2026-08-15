import { exec } from 'child_process';

export function execCommand(command, options = {}) {
  return new Promise((resolve) => {
    exec(command, options, (error, stdout, stderr) => {
      resolve({
        stdout: stdout || '',
        stderr: stderr || '',
        error: error ? error.message : null
      });
    });
  });
}

export function openUrl(url) {
  const safeUrl = String(url).replace(/"/g, '\\"');
  const cmd = process.platform === 'win32'
    ? `start "" "${safeUrl}"`
    : `xdg-open "${safeUrl}"`;

  return execCommand(cmd);
}

export function executeProviderCommand(provider, payload) {
  if (provider === 'spotify' && payload.query) {
    const uri = `spotify:search:${payload.query}`;
    return openUrl(uri);
  }

  if (provider === 'youtube' && (payload.id || payload.url)) {
    const playUrl = payload.url || `https://www.youtube.com/watch?v=${payload.id}`;
    return openUrl(playUrl);
  }

  return Promise.resolve({ error: 'Unsupported provider or missing id/url' });
}
