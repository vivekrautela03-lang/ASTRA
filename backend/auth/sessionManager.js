/**
 * ASTRA OS — Multi-Device Session Manager
 */

export class SessionManager {
  constructor() {
    this.sessions = new Map();
    this.initDefaultOwnerSession();
  }

  initDefaultOwnerSession() {
    this.createSession({
      userId: 'usr-vivek-owner',
      deviceId: 'dev-desktop-01',
      deviceType: 'Desktop',
      ip: '127.0.0.1',
      userAgent: 'ASTRA-Desktop-Client/10.0'
    });
  }

  createSession({ userId, deviceId, deviceType = 'Desktop', ip = '127.0.0.1', userAgent = '' }) {
    const sessionId = `sess-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const session = {
      id: sessionId,
      userId,
      deviceId,
      deviceType,
      ip,
      userAgent,
      status: 'ACTIVE',
      lastActiveAt: new Date().toISOString(),
      createdAt: new Date().toISOString()
    };
    this.sessions.set(sessionId, session);
    return session;
  }

  touchSession(sessionId) {
    const sess = this.sessions.get(sessionId);
    if (sess) {
      sess.lastActiveAt = new Date().toISOString();
    }
  }

  revokeSession(sessionId) {
    return this.sessions.delete(sessionId);
  }

  getUserSessions(userId) {
    return Array.from(this.sessions.values()).filter(s => s.userId === userId);
  }
}

export const sessionManager = new SessionManager();
