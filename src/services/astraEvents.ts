import type { AstraOrbState } from '../components/astra/AstraOrb';

export type AstraEventType =
  | 'wake_detected'
  | 'wake_cancel'
  | 'manual_wake'
  | 'query_submitted'
  | 'speech_ended'
  | 'response_started'
  | 'response_finished'
  | 'state_change';

export interface AstraEvent {
  type: AstraEventType;
  payload?: any;
  timestamp?: number;
}

type AstraEventListener = (event: AstraEvent) => void;

class AstraEventManager {
  private listeners: Set<AstraEventListener> = new Set();

  constructor() {
    if (typeof window !== 'undefined') {
      // Expose globally for WebSocket, Electron IPC, extensions, hotkeys
      (window as any).handleAstraEvent = (event: AstraEvent) => this.dispatch(event);
      (window as any).setAstraState = (state: AstraOrbState, status?: string) => {
        this.dispatch({
          type: 'state_change',
          payload: { state, status }
        });
      };
    }
  }

  public dispatch(event: AstraEvent): void {
    const enrichedEvent: AstraEvent = {
      ...event,
      timestamp: event.timestamp || Date.now()
    };

    console.log(`[ASTRA EVENT BUS]: ${enrichedEvent.type}`, enrichedEvent.payload || '');
    this.listeners.forEach((listener) => {
      try {
        listener(enrichedEvent);
      } catch (err) {
        console.error('[ASTRA EVENT LISTENER ERROR]:', err);
      }
    });

    // Also dispatch custom DOM event for external tools & Electron IPC
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('astra-event', { detail: enrichedEvent })
      );
    }
  }

  public subscribe(listener: AstraEventListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }
}

export const astraEvents = new AstraEventManager();

export function handleAstraEvent(event: AstraEvent): void {
  astraEvents.dispatch(event);
}

export function onAstraEvent(listener: AstraEventListener): () => void {
  return astraEvents.subscribe(listener);
}
