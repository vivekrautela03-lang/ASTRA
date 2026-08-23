import type { AstraDesktopAPI } from '../../electron/preload';

declare global {
  interface Window {
    astra?: {
      desktop?: AstraDesktopAPI;
    };
  }
}

export {};
