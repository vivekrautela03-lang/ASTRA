import { handleAstraEvent } from '../astraEvents';

export class WakeWordDetector {
  private recognition: any = null;
  private isListening: boolean = false;
  private isEnabled: boolean = true;
  private wakePatterns = [
    /hey astra/i,
    /hi astra/i,
    /ok astra/i,
    /okay astra/i,
    /wake astra/i,
    /hello astra/i,
    /^astra\b/i
  ];

  constructor() {
    this.initSpeechRecognition();
    this.initGlobalHotkeys();
  }

  private initSpeechRecognition(): void {
    if (typeof window === 'undefined') return;

    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      console.warn('[WAKE WORD]: Web Speech Recognition not available in this browser.');
      return;
    }

    try {
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = true;
      this.recognition.interimResults = true;
      this.recognition.lang = 'en-US';

      this.recognition.onresult = (event: any) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          transcript += event.results[i][0].transcript;
        }

        const clean = transcript.trim().toLowerCase();
        for (const pattern of this.wakePatterns) {
          if (pattern.test(clean)) {
            console.log(`[WAKE WORD TRIGGERED]: "${clean}" matched ${pattern}`);
            handleAstraEvent({
              type: 'wake_detected',
              payload: { transcript: clean }
            });
            break;
          }
        }
      };

      this.recognition.onerror = (event: any) => {
        if (event.error !== 'aborted' && this.isListening && this.isEnabled) {
          setTimeout(() => {
            if (this.isListening && this.isEnabled) {
              try {
                this.recognition?.start();
              } catch {
                // ignore
              }
            }
          }, 500);
        }
      };

      this.recognition.onend = () => {
        if (this.isListening && this.isEnabled) {
          setTimeout(() => {
            if (this.isListening && this.isEnabled) {
              try {
                this.recognition?.start();
              } catch {
                // ignore
              }
            }
          }, 300);
        }
      };
    } catch (err) {
      console.warn('[WAKE WORD]: Failed to initialize background recognition:', err);
    }
  }

  private initGlobalHotkeys(): void {
    if (typeof window === 'undefined') return;

    window.addEventListener('keydown', (e: KeyboardEvent) => {
      // Alt+Space or Ctrl+Space to summon Astra instantly
      if ((e.altKey && e.code === 'Space') || (e.ctrlKey && e.code === 'Space')) {
        e.preventDefault();
        handleAstraEvent({
          type: 'manual_wake',
          payload: { trigger: 'keyboard_shortcut' }
        });
      }

      // Escape to cancel/dismiss Astra floating overlay
      if (e.key === 'Escape') {
        handleAstraEvent({
          type: 'wake_cancel',
          payload: { trigger: 'escape_key' }
        });
      }
    });
  }

  public start(): void {
    if (!this.recognition || this.isListening || !this.isEnabled) return;
    this.isListening = true;
    try {
      this.recognition.start();
      console.log('[WAKE WORD]: Listening for "Hey Astra"...');
    } catch {
      // ignore
    }
  }

  public stop(): void {
    this.isListening = false;
    if (this.recognition) {
      try {
        this.recognition.stop();
      } catch {
        // ignore
      }
    }
  }

  public setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
    if (enabled) {
      this.start();
    } else {
      this.stop();
    }
  }
}

export const wakeWordDetector = new WakeWordDetector();
