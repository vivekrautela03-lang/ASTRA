import { app, BrowserWindow, globalShortcut, Tray, Menu, ipcMain, nativeImage } from 'electron';
import path from 'path';
import fs from 'fs';
import { WindowManager } from './windows';
import http from 'http';

// Declare custom property on app for clean exit
declare global {
  namespace Electron {
    interface App {
      isQuitting?: boolean;
    }
  }
}

app.isQuitting = false;

let windowManager: WindowManager | null = null;
let tray: Tray | null = null;

const PORT = process.env.PORT || 8990;

// Single instance lock
const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
  app.quit();
} else {
  app.on('second-instance', () => {
    if (windowManager) {
      windowManager.showAndFocus();
    }
  });
}

function checkServerHealthy(port: number | string): Promise<boolean> {
  return new Promise((resolve) => {
    const req = http.get(`http://localhost:${port}/health`, (res) => {
      resolve(res.statusCode === 200);
    });
    req.on('error', () => resolve(false));
    req.setTimeout(600, () => {
      req.destroy();
      resolve(false);
    });
  });
}

async function ensureBackendServer() {
  const isHealthy = await checkServerHealthy(PORT);
  if (!isHealthy) {
    try {
      // Dynamically initialize the backend server directly in-process
      const serverPath = path.resolve(__dirname, '../server/index.js');
      if (fs.existsSync(serverPath)) {
        await import(`file://${serverPath.replace(/\\/g, '/')}`);
        // Wait for server ready
        for (let i = 0; i < 15; i++) {
          await new Promise(r => setTimeout(r, 200));
          if (await checkServerHealthy(PORT)) break;
        }
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.warn('[ELECTRON] Backend server auto-start warning:', msg);
    }
  }
}

function createTray(win: BrowserWindow) {
  const icon = nativeImage.createFromBuffer(
    Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAZklEQVQ4T2NkoBAwUqifYdQABmJs+k+ePBkGk5OTh1hGRkYm/P//nwENk20AkgpGjBhhgC5GjmGM0dHR8eg2kGUASf6PHTv2PzY5ZGFGsgHI9sHcgM0Qkg0gJb2Qk2FIBgB6V4wXQ1R4+AAAAABJRU5ErkJggg==',
      'base64'
    )
  );

  tray = new Tray(icon);
  tray.setToolTip('ASTRA — Personal AI Operating System');

  const contextMenu = Menu.buildFromTemplate([
    {
      label: '✦ ASTRA AI Assistant',
      enabled: false
    },
    { type: 'separator' },
    {
      label: 'Open Astra (Ctrl+Space)',
      click: () => {
        windowManager?.showAndFocus();
        win.webContents.send('astra:shortcut-activate');
      }
    },
    {
      label: 'Start Listening',
      click: () => {
        windowManager?.showAndFocus();
        win.webContents.send('astra:shortcut-listen');
      }
    },
    {
      label: 'Settings',
      click: () => {
        windowManager?.showAndFocus();
      }
    },
    { type: 'separator' },
    {
      label: 'Quit Astra',
      click: () => {
        app.isQuitting = true;
        app.quit();
      }
    }
  ]);

  tray.setContextMenu(contextMenu);
  tray.on('click', () => {
    if (win.isVisible()) {
      win.hide();
    } else {
      windowManager?.showAndFocus();
    }
  });
}

function registerGlobalShortcuts(win: BrowserWindow) {
  let success = globalShortcut.register('CommandOrControl+Space', () => {
    if (win.isVisible()) {
      win.webContents.send('astra:shortcut-activate');
      win.focus();
    } else {
      windowManager?.showAndFocus();
      win.webContents.send('astra:shortcut-listen');
    }
  });

  if (!success) {
    globalShortcut.register('Alt+Space', () => {
      if (win.isVisible()) {
        win.webContents.send('astra:shortcut-activate');
        win.focus();
      } else {
        windowManager?.showAndFocus();
        win.webContents.send('astra:shortcut-listen');
      }
    });
  }
}

function setupIPC(win: BrowserWindow) {
  ipcMain.on('astra:open', () => {
    windowManager?.setExpanded(true);
    windowManager?.showAndFocus();
  });

  ipcMain.on('astra:minimize', () => {
    windowManager?.setExpanded(false);
  });

  ipcMain.on('astra:close', () => {
    win.hide();
  });

  ipcMain.on('astra:set-always-on-top', (_e, flag: boolean) => {
    win.setAlwaysOnTop(flag, 'floating');
  });

  ipcMain.on('astra:resize', (_e, width: number, height: number) => {
    win.setSize(width, height);
  });

  ipcMain.handle('astra:get-position', () => {
    const pos = win.getPosition();
    return { x: pos[0], y: pos[1] };
  });

  ipcMain.on('astra:set-position', (_e, x: number, y: number) => {
    win.setPosition(x, y);
  });
}

app.whenReady().then(async () => {
  await ensureBackendServer();

  windowManager = new WindowManager();
  const preloadPath = path.join(__dirname, 'preload.js');
  const win = windowManager.createMainWindow(preloadPath);

  createTray(win);
  registerGlobalShortcuts(win);
  setupIPC(win);

  // Load URL or dist/index.html
  const distIndex = path.resolve(__dirname, '../dist/index.html');
  if (process.env.VITE_DEV_SERVER_URL) {
    await win.loadURL(process.env.VITE_DEV_SERVER_URL);
  } else if (fs.existsSync(distIndex)) {
    await win.loadFile(distIndex);
  } else {
    await win.loadURL(`http://localhost:${PORT}`);
  }

  win.show();
  win.focus();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      windowManager?.createMainWindow(preloadPath);
    } else {
      windowManager?.showAndFocus();
    }
  });
});

app.on('will-quit', () => {
  globalShortcut.unregisterAll();
});

app.on('window-all-closed', () => {
  if (app.isQuitting) {
    app.quit();
  }
});
