export class SpeechToTextService {
  private recognition: any = null;
  private isListeningState: boolean = false;
  private silenceTimer: any = null;
  private onResultCallback?: (transcript: string, isFinal: boolean) => void;
  private onStateChangeCallback?: (isListening: boolean) => void;

  constructor() {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        this.recognition = new SpeechRecognition();
        this.recognition.continuous = true;
        this.recognition.interimResults = true;
        this.recognition.lang = 'en-US';

        this.recognition.onresult = (event: any) => {
          let interim = '';
          let final = '';

          for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
              final += event.results[i][0].transcript;
            } else {
              interim += event.results[i][0].transcript;
            }
          }

          if (final.trim()) {
            if (this.silenceTimer) clearTimeout(this.silenceTimer);
            if (this.onResultCallback) {
              this.onResultCallback(final.trim(), true);
            }
          } else if (interim.trim()) {
            if (this.onResultCallback) {
              this.onResultCallback(interim.trim(), false);
            }
            if (this.silenceTimer) clearTimeout(this.silenceTimer);
            this.silenceTimer = setTimeout(() => {
              if (this.onResultCallback) {
                this.onResultCallback(interim.trim(), true);
              }
            }, 1200);
          }
        };

        this.recognition.onerror = (event: any) => {
          console.warn('[ASTRA STT Error]:', event.error);
          if (event.error !== 'aborted' && this.isListeningState) {
            setTimeout(() => {
              try { this.recognition?.start(); } catch { /* Ignore */ }
            }, 300);
          }
        };

        this.recognition.onend = () => {
          if (this.isListeningState) {
            setTimeout(() => {
              try { this.recognition?.start(); } catch { /* Ignore */ }
            }, 200);
          }
        };
      }
    }
  }

  public isAvailable(): boolean {
    return this.recognition !== null;
  }

  public startListening(
    onResult: (transcript: string, isFinal: boolean) => void,
    onStateChange?: (isListening: boolean) => void
  ): void {
    if (!this.recognition) return;

    this.onResultCallback = onResult;
    this.onStateChangeCallback = onStateChange;
    this.isListeningState = true;

    if (this.onStateChangeCallback) {
      this.onStateChangeCallback(true);
    }

    try {
      this.recognition.start();
    } catch {
      // Recognition might already be running
    }
  }

  public stopListening(): void {
    this.isListeningState = false;
    if (this.silenceTimer) clearTimeout(this.silenceTimer);

    if (this.onStateChangeCallback) {
      this.onStateChangeCallback(false);
    }

    if (this.recognition) {
      try {
        this.recognition.stop();
      } catch {
        // Ignore
      }
    }
  }

  public isListening(): boolean {
    return this.isListeningState;
  }
}

export const speechToTextService = new SpeechToTextService();
