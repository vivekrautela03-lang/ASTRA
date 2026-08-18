/**
 * ASTRA OS — Proactive Notification Engine
 */

export class NotificationEngine {
  constructor() {
    this.notifications = [];
  }

  notify({ title, message, level = 'INFO', channel = 'ALL' }) {
    const notification = {
      id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      title,
      message,
      level,
      channel,
      read: false,
      timestamp: new Date().toISOString()
    };

    this.notifications.unshift(notification);
    if (this.notifications.length > 100) {
      this.notifications.pop();
    }

    return notification;
  }

  getRecent(limit = 20) {
    return this.notifications.slice(0, limit);
  }

  markAsRead(id) {
    const notif = this.notifications.find(n => n.id === id);
    if (notif) notif.read = true;
    return notif;
  }
}

export const notificationEngine = new NotificationEngine();
