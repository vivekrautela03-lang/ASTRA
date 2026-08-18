/**
 * ASTRA OS — Voice Session & Audio Streaming Pipeline
 */

export class VoiceSessionManager {
  constructor() {
    this.activeSession = null;
    this.state = 'IDLE'; // IDLE, LISTENING, PROCESSING, SPEAKING
  }

  createSession({ clientType = 'WebSpeech', sampleRate = 16000 } = {}) {
    const sessionId = `voice-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    this.activeSession = {
      sessionId,
      clientType,
      sampleRate,
      wakeWord: 'Hey Astra',
      vadActive: true,
      startedAt: new Date().toISOString()
    };
    this.state = 'LISTENING';
    return this.activeSession;
  }

  processAudioChunk(chunkBase64) {
    if (!this.activeSession) return { status: 'NO_SESSION' };
    return {
      status: 'CHUNK_BUFFERED',
      bytes: chunkBase64 ? chunkBase64.length : 0,
      timestamp: new Date().toISOString()
    };
  }

  endSession() {
    this.activeSession = null;
    this.state = 'IDLE';
    return { success: true };
  }

  getStatus() {
    return {
      state: this.state,
      activeSession: this.activeSession
    };
  }
}

export const voiceSessionManager = new VoiceSessionManager();
