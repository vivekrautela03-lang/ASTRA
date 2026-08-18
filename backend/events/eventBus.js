/**
 * ASTRA OS — Autonomous Event Bus
 */

export class EventBus {
  constructor() {
    this.listeners = new Map();
    this.eventHistory = [];
  }

  subscribe(eventType, callback) {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, []);
    }
    this.listeners.get(eventType).push(callback);
    return () => {
      const arr = this.listeners.get(eventType) || [];
      this.listeners.set(eventType, arr.filter(cb => cb !== callback));
    };
  }

  emit(eventType, payload = {}) {
    const event = {
      id: `evt-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      type: eventType,
      payload,
      timestamp: new Date().toISOString()
    };

    this.eventHistory.unshift(event);
    if (this.eventHistory.length > 200) {
      this.eventHistory.pop();
    }

    const callbacks = this.listeners.get(eventType) || [];
    for (const cb of callbacks) {
      try {
        cb(event);
      } catch (err) {
        console.error(`[EventBus] Error in listener for ${eventType}:`, err);
      }
    }

    return event;
  }

  getRecentEvents(limit = 50) {
    return this.eventHistory.slice(0, limit);
  }
}

export const eventBus = new EventBus();
