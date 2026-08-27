import { BrowserWindow, screen, app } from 'electron';
import path from 'path';
import fs from 'fs';

export interface WindowState {
  x?: number;
  y?: number;
  width: number;
  height: number;
  isMaximized?: boolean;
}

export class WindowManager {
  private mainWindow: BrowserWindow | null = null;
  private state: WindowState = {
    width: 1280,
    height: 840,
    isMaximized: false
  };

  constructor() {
    this.loadState();
  }

  private getConfigFile(): string {
    try {
      return path.join(app.getPath('userData'), 'window-state.json');
    } catch {
      return path.join(process.cwd(), 'window-state.json');
    }
  }

  private loadState() {
    try {
      const configFile = this.getConfigFile();
      if (fs.existsSync(configFile)) {
        const raw = fs.readFileSync(configFile, 'utf8');
        this.state = { ...this.state, ...JSON.parse(raw) };
      }
    } catch {
      // Use defaults
    }
  }

  public saveState() {
    try {
      if (this.mainWindow && !this.mainWindow.isDestroyed()) {
        const isMaximized = this.mainWindow.isMaximized();
        this.state.isMaximized = isMaximized;
        if (!isMaximized) {
          const bounds = this.mainWindow.getBounds();
          this.state.x = bounds.x;
          this.state.y = bounds.y;
          this.state.width = bounds.width;
          this.state.height = bounds.height;
        }
      }
      fs.writeFileSync(this.getConfigFile(), JSON.stringify(this.state, null, 2), 'utf8');
    } catch {
      // Ignore
    }
  }

  public createMainWindow(preloadPath: string): BrowserWindow {
    const primaryDisplay = screen.getPrimaryDisplay();
    const workArea = primaryDisplay.workArea;

    const initialWidth = Math.min(this.state.width || 1280, workArea.width);
    const initialHeight = Math.min(this.state.height || 840, workArea.height);

    const defaultX = Math.round(workArea.x + (workArea.width - initialWidth) / 2);
    const defaultY = Math.round(workArea.y + (workArea.height - initialHeight) / 2);

    const posX = this.state.x !== undefined && this.isWithinScreen(this.state.x, this.state.y ?? 0)
      ? this.state.x
      : defaultX;
    const posY = this.state.y !== undefined && this.isWithinScreen(posX, this.state.y)
      ? this.state.y
      : defaultY;

    this.mainWindow = new BrowserWindow({
      x: posX,
      y: posY,
      width: initialWidth,
      height: initialHeight,
      minWidth: 800,
      minHeight: 600,
      frame: true,
      title: 'Astra AI Assistant',
      backgroundColor: '#000000',
      autoHideMenuBar: true,
      show: false,
      webPreferences: {
        preload: preloadPath,
        contextIsolation: true,
        nodeIntegration: false,
        sandbox: false,
        webSecurity: false // allow local asset loading in standalone mode
      }
    });

    // Restore maximized state if saved
    if (this.state.isMaximized) {
      this.mainWindow.maximize();
    }

    // Save bounds on move/resize
    this.mainWindow.on('moved', () => this.saveState());
    this.mainWindow.on('resized', () => this.saveState());

    // Clean exit handling
    this.mainWindow.on('close', () => {
      this.saveState();
    });

    return this.mainWindow;
  }

  public getWindow(): BrowserWindow | null {
    return this.mainWindow;
  }

  public showAndFocus() {
    if (this.mainWindow) {
      if (this.mainWindow.isMinimized()) this.mainWindow.restore();
      this.mainWindow.show();
      this.mainWindow.focus();
    }
  }

  private isWithinScreen(x: number, y: number): boolean {
    const displays = screen.getAllDisplays();
    return displays.some(d => {
      const b = d.bounds;
      return x >= b.x && x <= b.x + b.width - 100 && y >= b.y && y <= b.y + b.height - 100;
    });
  }
}
