import { app, BrowserWindow, globalShortcut, Tray, Menu, ipcMain, nativeImage } from 'electron';
import path from 'path';
import fs from 'fs';
import { WindowManager } from './windows';

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

function createTray(win: BrowserWindow) {
  // Built-in base64 tray icon (16x16 cyan orb)
  const icon = nativeImage.createFromBuffer(
    Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAZklEQVQ4T2NkoBAwUqifYdQABmJs+k+ePBkGk5OTh1hGRkYm/P//nwENk20AkgpGjBhhgC5GjmGM0dHR8eg2kGUASf6PHTv2PzY5ZGFGsgHI9sHcgM0Qkg0gJb2Qk2FIBgB6V4wXQ1R4+AAAAABJRU5ErkJggg==',
      'base64'
    )
  );

  try {
    tray = new Tray(icon);
    tray.setToolTip('ASTRA — Personal AI Operating System');

    const contextMenu = Menu.buildFromTemplate([
      {
        label: '✦ Astra AI Assistant',
        enabled: false
      },
      { type: 'separator' },
      {
        label: 'Open Astra (Alt+Space)',
        click: () => {
          windowManager?.showAndFocus();
          win.webContents.send('astra:shortcut-activate');
        }
      },
      {
        label: 'Wake Astra (Voice)',
        click: () => {
          windowManager?.showAndFocus();
          win.webContents.send('astra:shortcut-listen');
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
  } catch (err) {
    console.warn('[TRAY WARNING]:', err);
  }
}

function registerGlobalShortcuts(win: BrowserWindow) {
  try {
    globalShortcut.register('CommandOrControl+Space', () => {
      if (win.isVisible()) {
        win.webContents.send('astra:shortcut-activate');
        win.focus();
      } else {
        windowManager?.showAndFocus();
        win.webContents.send('astra:shortcut-listen');
      }
    });

    globalShortcut.register('Alt+Space', () => {
      if (win.isVisible()) {
        win.webContents.send('astra:shortcut-activate');
        win.focus();
      } else {
        windowManager?.showAndFocus();
        win.webContents.send('astra:shortcut-listen');
      }
    });
  } catch (err) {
    console.warn('[SHORTCUT REGISTRATION WARNING]:', err);
  }
}

function setupIPC(win: BrowserWindow) {
  ipcMain.on('astra:open', () => {
    windowManager?.showAndFocus();
  });

  ipcMain.on('astra:minimize', () => {
    win.minimize();
  });

  ipcMain.on('astra:maximize', () => {
    if (win.isMaximized()) {
      win.unmaximize();
    } else {
      win.maximize();
    }
  });

  ipcMain.on('astra:close', () => {
    win.close();
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
  windowManager = new WindowManager();
  const preloadPath = path.join(__dirname, 'preload.js');
  const win = windowManager.createMainWindow(preloadPath);

  createTray(win);
  registerGlobalShortcuts(win);
  setupIPC(win);

  // Load Frontend:
  // In development: load Vite dev server URL (e.g. http://localhost:3000 or http://localhost:5173)
  // In production: load local dist/index.html directly without needing localhost or node
  const devUrl = process.env.VITE_DEV_SERVER_URL;
  const distIndex = path.resolve(__dirname, '../dist/index.html');

  if (devUrl) {
    console.log('[ELECTRON]: Loading development server URL:', devUrl);
    await win.loadURL(devUrl);
  } else if (fs.existsSync(distIndex)) {
    console.log('[ELECTRON]: Loading local production bundle:', distIndex);
    await win.loadFile(distIndex);
  } else {
    // Fallback attempt to standard Vite dev port
    console.log('[ELECTRON]: Fallback to local dev port...');
    await win.loadURL('http://localhost:3000').catch(() => win.loadURL('http://localhost:5173'));
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
  if (process.platform !== 'darwin' || app.isQuitting) {
    app.quit();
  }
});
