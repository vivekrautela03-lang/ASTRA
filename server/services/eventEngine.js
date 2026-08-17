/**
 * ASTRA OS — Proactive Intelligence & Event Engine
 */

export class EventEngine {
  constructor() {
    this.events = [];
    this.subscribers = new Set();
  }

  subscribe(callback) {
    this.subscribers.add(callback);
    return () => this.subscribers.delete(callback);
  }

  emit(type, payload) {
    const event = {
      id: `evt-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      type,
      payload,
      timestamp: new Date().toISOString()
    };
    this.events.unshift(event);
    if (this.events.length > 100) this.events.pop();

    for (const callback of this.subscribers) {
      try {
        callback(event);
      } catch (err) {
        console.error('[EventEngine] Subscriber callback failed', err);
      }
    }
    return event;
  }

  getRecentEvents(limit = 20) {
    return this.events.slice(0, limit);
  }
}

export const eventEngine = new EventEngine();
