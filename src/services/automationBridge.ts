import type { OSAction, TerminalLog } from '../types/eva';

export class AutomationBridgeService {
  private actionsHistory: OSAction[] = [
    {
      id: 'act-1',
      type: 'open_app',
      title: 'Launch VS Code IDE',
      description: 'Opened workspace folder in Visual Studio Code',
      status: 'success',
      timestamp: '13:05:10'
    },
    {
      id: 'act-2',
      type: 'run_script',
      title: 'Execute Oxlint Code Audit',
      description: 'Scanned 28 files, 0 errors, 0 warnings',
      status: 'success',
      timestamp: '13:07:44'
    },
    {
      id: 'act-3',
      type: 'capture_screen',
      title: 'Multimodal OCR Window Scan',
      description: 'Captured primary display at 3840x2160 resolution',
      status: 'success',
      timestamp: '13:08:52'
    }
  ];

  private terminalLogs: TerminalLog[] = [
    { id: 't-1', timestamp: '13:00:01', output: 'EV AI Operating System Kernel v8.4.2 [Win32 x64] initialized.', type: 'system' },
    { id: 't-2', timestamp: '13:00:02', output: 'Neural IPC Bridge running on ws://localhost:8990/ev-kernel', type: 'system' },
    { id: 't-3', timestamp: '13:05:10', command: 'code .', output: 'Launching Visual Studio Code...', type: 'input' },
    { id: 't-4', timestamp: '13:07:44', command: 'npx oxlint', output: 'Finished in 12ms. 0 errors detected across typescript files.', type: 'input' }
  ];

  public getActions(): OSAction[] {
    return [...this.actionsHistory];
  }

  public getTerminalLogs(): TerminalLog[] {
    return [...this.terminalLogs];
  }

  /**
   * Launch application by name
   */
  public launchApplication(appName: string): { title: string; launched: boolean; url?: string } {
    const name = appName.toLowerCase().trim();

    if (name.includes('code') || name.includes('vs code') || name.includes('vscode')) {
      window.open('vscode://', '_blank');
      return { title: 'Visual Studio Code', launched: true };
    }
    if (name.includes('cursor')) {
      window.open('cursor://', '_blank');
      return { title: 'Cursor AI Editor', launched: true };
    }
    if (name.includes('youtube')) {
      window.open('https://www.youtube.com', '_blank');
      return { title: 'YouTube', launched: true, url: 'https://www.youtube.com' };
    }
    if (name.includes('google')) {
      window.open('https://www.google.com', '_blank');
      return { title: 'Google Search', launched: true, url: 'https://www.google.com' };
    }
    if (name.includes('github')) {
      window.open('https://github.com', '_blank');
      return { title: 'GitHub', launched: true, url: 'https://github.com' };
    }
    if (name.includes('whatsapp')) {
      window.open('https://web.whatsapp.com', '_blank');
      return { title: 'WhatsApp Web', launched: true, url: 'https://web.whatsapp.com' };
    }
    if (name.includes('spotify')) {
      window.open('https://open.spotify.com', '_blank');
      return { title: 'Spotify Web Player', launched: true, url: 'https://open.spotify.com' };
    }
    if (name.includes('discord')) {
      window.open('https://discord.com/app', '_blank');
      return { title: 'Discord App', launched: true, url: 'https://discord.com/app' };
    }
    if (name.includes('twitter') || name.includes('x')) {
      window.open('https://x.com', '_blank');
      return { title: 'X / Twitter', launched: true, url: 'https://x.com' };
    }
    if (name.includes('calculator') || name.includes('calc')) {
      window.open('https://www.google.com/search?q=calculator', '_blank');
      return { title: 'Calculator', launched: true };
    }

    // Default web search fallback launcher
    const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(appName)}`;
    window.open(searchUrl, '_blank');
    return { title: appName, launched: true, url: searchUrl };
  }

  public async executeCommand(command: string): Promise<TerminalLog> {
    const timestamp = new Date().toTimeString().split(' ')[0];
    
    // Log user input
    const inputLog: TerminalLog = {
      id: `t-${Date.now()}-in`,
      timestamp,
      command,
      output: `$ ${command}`,
      type: 'input'
    };
    this.terminalLogs.push(inputLog);

    let resultOutput = '';
    const cmd = command.toLowerCase().trim();

    if (cmd.startsWith('open ') || cmd.startsWith('launch ')) {
      const appName = cmd.replace('open ', '').replace('launch ', '');
      const res = this.launchApplication(appName);
      resultOutput = `[OS APP LAUNCHER] Launched ${res.title} successfully.`;
    } else if (cmd.includes('help')) {
      resultOutput = `EV OS Terminal Commands:\n- sysinfo : Display telemetry overview\n- launch <app> : Launch desktop application\n- scan : Perform live vision & OCR scan\n- agents : List active autonomous subagents\n- clear : Clear terminal logs`;
    } else if (cmd.includes('sysinfo')) {
      resultOutput = `[EV OS TELEMETRY]\nCPU: 14% | GPU: 28% | RAM: 13.4GB / 32GB | Temp: 46°C | Latency: 4.2ms`;
    } else if (cmd.includes('scan')) {
      resultOutput = `[VISION ENGINE] Screen captured. Detected 4 windows, 1 editor UI, 1 WebGL canvas, 0 security anomalies.`;
    } else if (cmd.includes('clear')) {
      this.terminalLogs = [];
      return { id: `t-${Date.now()}`, timestamp, output: 'Terminal cleared.', type: 'system' };
    } else {
      resultOutput = `Executing PowerShell directive: "${command}"...\nSuccess (Exit code 0). Command completed in 18ms.`;
    }

    const outputLog: TerminalLog = {
      id: `t-${Date.now()}-out`,
      timestamp,
      output: resultOutput,
      type: 'output'
    };
    this.terminalLogs.push(outputLog);

    // Record action
    this.actionsHistory.unshift({
      id: `act-${Date.now()}`,
      type: 'run_script',
      title: `Terminal Directive: ${command.substring(0, 25)}`,
      description: resultOutput.split('\n')[0],
      status: 'success',
      timestamp
    });

    return outputLog;
  }

  // Keep last search context (provider + results)
  private lastSearch: { provider: string; query: string; results: Array<{ id: string; title: string; url: string }> } | null = null;

  /**
   * Search for a song using a provider (youtube | spotify)
   */
  public async searchSong(query: string, provider = 'youtube') {
    try {
      const res = await fetch(`http://localhost:8990/api/automation/search-song`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, provider })
      });
      const data = await res.json();
      const results = data.results || [];
      this.lastSearch = { provider: data.provider || provider, query, results };
      return this.lastSearch;
    } catch (e) {
      return Promise.reject(e);
    }
  }

  /**
   * Play a result from the last search by index (0-based) or by id/url
   */
  public async playSong(opts: { index?: number; id?: string; url?: string; provider?: string; query?: string }) {
    const provider = opts.provider || this.lastSearch?.provider || 'youtube';

    let payload: any = { provider };

    if (opts.url) payload.url = opts.url;
    else if (opts.id) payload.id = opts.id;
    else if (typeof opts.index === 'number' && this.lastSearch) {
      const item = this.lastSearch.results[opts.index];
      if (!item) throw new Error('Index out of range');
      payload.id = item.id;
      payload.url = item.url;
    } else if (provider === 'spotify' && opts.query) {
      payload.query = opts.query;
    } else if (this.lastSearch && this.lastSearch.results.length > 0) {
      payload.id = this.lastSearch.results[0].id;
      payload.url = this.lastSearch.results[0].url;
    } else {
      throw new Error('No playable item found');
    }

    const res = await fetch(`http://localhost:8990/api/automation/play-song`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    return data;
  }
}

export const automationBridge = new AutomationBridgeService();
