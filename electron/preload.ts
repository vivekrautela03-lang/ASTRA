import { contextBridge, ipcRenderer } from 'electron';

export interface AstraDesktopAPI {
  isElectron: boolean;
  open: () => void;
  minimize: () => void;
  close: () => void;
  setAlwaysOnTop: (flag: boolean) => void;
  resize: (width: number, height: number) => void;
  getPosition: () => Promise<{ x: number; y: number }>;
  setPosition: (x: number, y: number) => void;
  onGlobalActivate: (callback: () => void) => () => void;
  onGlobalListen: (callback: () => void) => () => void;
}

const desktopAPI: AstraDesktopAPI = {
  isElectron: true,
  open: () => ipcRenderer.send('astra:open'),
  minimize: () => ipcRenderer.send('astra:minimize'),
  close: () => ipcRenderer.send('astra:close'),
  setAlwaysOnTop: (flag: boolean) => ipcRenderer.send('astra:set-always-on-top', flag),
  resize: (width: number, height: number) => ipcRenderer.send('astra:resize', width, height),
  getPosition: () => ipcRenderer.invoke('astra:get-position'),
  setPosition: (x: number, y: number) => ipcRenderer.send('astra:set-position', x, y),
  onGlobalActivate: (callback: () => void) => {
    const handler = () => callback();
    ipcRenderer.on('astra:shortcut-activate', handler);
    return () => {
      ipcRenderer.removeListener('astra:shortcut-activate', handler);
    };
  },
  onGlobalListen: (callback: () => void) => {
    const handler = () => callback();
    ipcRenderer.on('astra:shortcut-listen', handler);
    return () => {
      ipcRenderer.removeListener('astra:shortcut-listen', handler);
    };
  }
};

contextBridge.exposeInMainWorld('astra', {
  desktop: desktopAPI
});
