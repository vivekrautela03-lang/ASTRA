export class WakeWordEngine {
  private wakeWordRecognition: any = null;
  private isWakeWordListening: boolean = false;
  private onWakeWordDetectedCallback?: () => void;

  constructor() {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        this.wakeWordRecognition = new SpeechRecognition();
        this.wakeWordRecognition.continuous = true;
        this.wakeWordRecognition.interimResults = true;
        this.wakeWordRecognition.lang = 'en-US';

        this.wakeWordRecognition.onresult = (event: any) => {
          for (let i = event.resultIndex; i < event.results.length; ++i) {
            const transcript = event.results[i][0].transcript.toLowerCase();
            if (
              transcript.includes('astra') ||
              transcript.includes('hey astra') ||
              transcript.includes('friday') ||
              transcript.includes('computer')
            ) {
              if (this.onWakeWordDetectedCallback) {
                this.onWakeWordDetectedCallback();
              }
              break;
            }
          }
        };

        this.wakeWordRecognition.onend = () => {
          if (this.isWakeWordListening) {
            setTimeout(() => {
              try { this.wakeWordRecognition?.start(); } catch { /* Ignore */ }
            }, 300);
          }
        };
      }
    }
  }

  public isAvailable(): boolean {
    return this.wakeWordRecognition !== null;
  }

  public startListening(onWakeWordDetected: () => void): void {
    if (!this.wakeWordRecognition) return;

    this.onWakeWordDetectedCallback = onWakeWordDetected;
    this.isWakeWordListening = true;

    try {
      this.wakeWordRecognition.start();
    } catch {
      // Might already be listening
    }
  }

  public stopListening(): void {
    this.isWakeWordListening = false;
    if (this.wakeWordRecognition) {
      try {
        this.wakeWordRecognition.stop();
      } catch {
        // Ignore
      }
    }
  }

  public isActive(): boolean {
    return this.isWakeWordListening;
  }
}

export const wakeWordEngine = new WakeWordEngine();
