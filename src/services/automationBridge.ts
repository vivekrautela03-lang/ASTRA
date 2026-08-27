import type { OSAction, TerminalLog } from '../types/eva';
import { supabaseService } from './supabaseClient';

export class AutomationBridgeService {
  private backendUrl = 'http://localhost:8990';

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
      title: 'Execute System Metrics Telemetry',
      description: 'Scanned hardware sensors and CPU utilization',
      status: 'success',
      timestamp: '13:07:44'
    },
    {
      id: 'act-3',
      type: 'capture_screen',
      title: 'Multimodal Vision Window Scan',
      description: 'Captured primary display at native resolution',
      status: 'success',
      timestamp: '13:08:52'
    }
  ];

  private terminalLogs: TerminalLog[] = [
    { id: 't-1', timestamp: '13:00:01', output: 'ASTRA Production AI Operating System Kernel active.', type: 'system' },
    { id: 't-2', timestamp: '13:00:02', output: 'Native Python Tool Bridge running on port 8991', type: 'system' },
    { id: 't-3', timestamp: '13:05:10', command: 'open_app("code")', output: 'Launching Visual Studio Code...', type: 'input' }
  ];

  public getActions(): OSAction[] {
    return [...this.actionsHistory];
  }

  public getTerminalLogs(): TerminalLog[] {
    return [...this.terminalLogs];
  }

  /**
   * Execute any tool via the Native Python Tool Kernel
   */
  public async executeTool(tool: string, args: Record<string, any> = {}): Promise<{ success: boolean; result?: string; error?: string }> {
    try {
      const res = await fetch(`${this.backendUrl}/api/tools/execute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tool, args })
      });
      const data = await res.json();
      
      const logEntry: TerminalLog = {
        id: `t-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString(),
        command: `${tool}(${JSON.stringify(args)})`,
        output: data.result || data.error || 'Done',
        type: data.success ? 'output' : 'error'
      };
      this.terminalLogs.unshift(logEntry);

      return data;
    } catch (err: any) {
      console.error(`[EXECUTE TOOL ERROR]: ${tool}:`, err);
      return { success: false, error: err.message };
    }
  }

  /**
   * Execute general shell command or directive
   */
  public async executeCommand(command: string): Promise<{ success: boolean; output: string }> {
    const res = await this.executeTool('computer_control', { action: 'type', text: command });
    return {
      success: res.success,
      output: res.result || res.error || 'Command executed.'
    };
  }

  /**
   * Search song on YouTube / Spotify
   */
  public async searchSong(query: string, _platformOrLimit?: string | number): Promise<any> {
    const res = await this.executeTool('youtube_video', { action: 'get_info', query });
    return res.result || [];
  }

  /**
   * Play song on YouTube / Spotify
   */
  public async playSong(song: any): Promise<boolean> {
    const query = typeof song === 'string' ? song : song?.title || song?.name || 'lofi music';
    const res = await this.executeTool('youtube_video', { action: 'play', query });
    return res.success;
  }

  /**
   * Launch application by name (local shell or web app fallback)
   */
  public launchApplication(appName: string): { title: string; launched: boolean; url?: string } {
    const name = appName.toLowerCase().trim();

    // Trigger Native Python Kernel execution
    this.executeTool('open_app', { app_name: name }).catch(() => {});

    const logEntry: TerminalLog = {
      id: `t-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString(),
      command: `open_app("${name}")`,
      output: `Launching ${appName}...`,
      type: 'input'
    };
    this.terminalLogs.unshift(logEntry);

    const actionItem: OSAction = {
      id: `act-${Date.now()}`,
      type: 'open_app',
      title: `Launch ${appName}`,
      description: `Dispatched native execution directive for ${appName}`,
      status: 'success',
      timestamp: new Date().toLocaleTimeString()
    };
    this.actionsHistory.unshift(actionItem);

    // Audit log
    supabaseService.logMessage(null, 'system', `Dispatched application launch for: ${name}`).catch(() => {});

    return {
      title: `Launched ${appName}`,
      launched: true
    };
  }

  /**
   * Get Live System Metrics from Python Kernel
   */
  public async getSystemMetrics(): Promise<any> {
    try {
      const res = await fetch(`${this.backendUrl}/api/tools/system-status`);
      return await res.json();
    } catch {
      return null;
    }
  }
}

export const automationBridge = new AutomationBridgeService();
