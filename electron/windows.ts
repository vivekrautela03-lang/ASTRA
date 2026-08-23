import { BrowserWindow, screen, app } from 'electron';
import path from 'path';
import fs from 'fs';

export interface WindowState {
  x?: number;
  y?: number;
  width: number;
  height: number;
  isExpanded: boolean;
}

const CONFIG_FILE = path.join(app.getPath('userData'), 'window-state.json');

export class WindowManager {
  private mainWindow: BrowserWindow | null = null;
  private state: WindowState = {
    width: 460,
    height: 650,
    isExpanded: true
  };

  constructor() {
    this.loadState();
  }

  private loadState() {
    try {
      if (fs.existsSync(CONFIG_FILE)) {
        const raw = fs.readFileSync(CONFIG_FILE, 'utf8');
        this.state = { ...this.state, ...JSON.parse(raw) };
      }
    } catch {
      // Use defaults
    }
  }

  public saveState() {
    try {
      if (this.mainWindow && !this.mainWindow.isDestroyed()) {
        const bounds = this.mainWindow.getBounds();
        this.state.x = bounds.x;
        this.state.y = bounds.y;
        this.state.width = bounds.width;
        this.state.height = bounds.height;
      }
      fs.writeFileSync(CONFIG_FILE, JSON.stringify(this.state, null, 2), 'utf8');
    } catch {
      // Ignore
    }
  }

  public createMainWindow(preloadPath: string): BrowserWindow {
    // Detect active display nearest to cursor
    const cursorPoint = screen.getCursorScreenPoint();
    const currentDisplay = screen.getDisplayNearestPoint(cursorPoint);
    const workArea = currentDisplay.workArea;

    // Default position: bottom-right with 28px margin
    const initialWidth = this.state.width || 460;
    const initialHeight = this.state.height || 650;
    const defaultX = workArea.x + workArea.width - initialWidth - 28;
    const defaultY = workArea.y + workArea.height - initialHeight - 28;

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
      minWidth: 360,
      minHeight: 500,
      frame: false,
      transparent: true,
      alwaysOnTop: true,
      hasShadow: false,
      resizable: true,
      skipTaskbar: false,
      show: false,
      backgroundColor: '#00000000',
      webPreferences: {
        preload: preloadPath,
        contextIsolation: true,
        nodeIntegration: false,
        sandbox: false,
        webSecurity: true
      }
    });

    // Save bounds on move/resize
    this.mainWindow.on('moved', () => this.saveState());
    this.mainWindow.on('resized', () => this.saveState());

    // Intercept close to hide window instead of terminating app
    this.mainWindow.on('close', (e) => {
      if (!app.isQuitting) {
        e.preventDefault();
        this.mainWindow?.hide();
      }
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
      this.mainWindow.setAlwaysOnTop(true, 'floating');
    }
  }

  public setExpanded(expanded: boolean) {
    if (!this.mainWindow) return;
    this.state.isExpanded = expanded;

    const cursorPoint = screen.getCursorScreenPoint();
    const currentDisplay = screen.getDisplayNearestPoint(cursorPoint);
    const workArea = currentDisplay.workArea;

    if (expanded) {
      const w = 460;
      const h = 650;
      const x = workArea.x + workArea.width - w - 28;
      const y = workArea.y + workArea.height - h - 28;
      this.mainWindow.setResizable(true);
      this.mainWindow.setBounds({ x, y, width: w, height: h });
    } else {
      const w = 110;
      const h = 120;
      const x = workArea.x + workArea.width - w - 28;
      const y = workArea.y + workArea.height - h - 28;
      this.mainWindow.setResizable(false);
      this.mainWindow.setBounds({ x, y, width: w, height: h });
    }
  }

  private isWithinScreen(x: number, y: number): boolean {
    const displays = screen.getAllDisplays();
    return displays.some(d => {
      const b = d.bounds;
      return x >= b.x && x <= b.x + b.width - 50 && y >= b.y && y <= b.y + b.height - 50;
    });
  }
}
