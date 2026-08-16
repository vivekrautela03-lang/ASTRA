export interface VoiceSettings {
  enabled: boolean;
  volume: number; // 0.0 to 1.0
  rate: number;   // 0.5 to 2.0
  pitch: number;  // 0.5 to 1.5
  selectedVoiceURI: string;
}

export class TextToSpeechService {
  private synth: SpeechSynthesis | null = typeof window !== 'undefined' ? window.speechSynthesis : null;
  private settings: VoiceSettings = {
    enabled: true,
    volume: 1.0,
    rate: 1.1,
    pitch: 1.02,
    selectedVoiceURI: ''
  };
  private isSpeakingState: boolean = false;
  private onSpeakingStateChange?: (isSpeaking: boolean) => void;

  constructor() {
    if (this.synth) {
      if (this.synth.onvoiceschanged !== undefined) {
        this.synth.onvoiceschanged = () => {
          this.autoSelectBestVoice();
        };
      }
      this.autoSelectBestVoice();
    }
  }

  public setOnSpeakingStateChange(cb: (isSpeaking: boolean) => void) {
    this.onSpeakingStateChange = cb;
  }

  private notifyState(isSpeaking: boolean) {
    this.isSpeakingState = isSpeaking;
    if (this.onSpeakingStateChange) {
      this.onSpeakingStateChange(isSpeaking);
    }
  }

  public getSettings(): VoiceSettings {
    return { ...this.settings };
  }

  public updateSettings(newSettings: Partial<VoiceSettings>) {
    this.settings = { ...this.settings, ...newSettings };
  }

  public getAvailableVoices(): SpeechSynthesisVoice[] {
    if (!this.synth) return [];
    return this.synth.getVoices();
  }

  private autoSelectBestVoice() {
    const voices = this.getAvailableVoices();
    if (voices.length === 0) return;

    if (!this.settings.selectedVoiceURI) {
      const preferred = voices.find(v =>
        v.name.includes('Natural') ||
        (v.name.includes('Google') && (v.name.includes('UK') || v.name.includes('US') || v.name.includes('English'))) ||
        v.name.includes('Samantha') ||
        v.name.includes('Victoria') ||
        v.name.includes('Zira') ||
        v.name.includes('Karen')
      ) || voices.find(v => v.lang.startsWith('en')) || voices[0];

      if (preferred) {
        this.settings.selectedVoiceURI = preferred.voiceURI;
      }
    }
  }

  public cleanTextForSpeech(text: string): string {
    return text
      .replace(/```[\s\S]*?```/g, 'I have generated the workspace script for you on screen, Boss.')
      .replace(/`([^`]+)`/g, '$1')
      .replace(/[*_~#>-]/g, ' ')
      .replace(/\[(.*?)\]\((.*?)\)/g, '$1')
      .replace(/\s+/g, ' ')
      .trim();
  }

  /**
   * Stop active speech output immediately
   */
  public stop(): void {
    if (this.synth) {
      this.synth.cancel();
    }
    this.notifyState(false);
  }

  /**
   * Speak full text string cleanly
   */
  public speak(text: string, onEnd?: () => void): void {
    if (!this.settings.enabled || !this.synth) {
      if (onEnd) onEnd();
      return;
    }

    this.stop();
    const cleanText = this.cleanTextForSpeech(text);
    if (!cleanText) {
      if (onEnd) onEnd();
      return;
    }

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.volume = this.settings.volume;
    utterance.rate = this.settings.rate;
    utterance.pitch = this.settings.pitch;

    const voices = this.getAvailableVoices();
    const voice = voices.find(v => v.voiceURI === this.settings.selectedVoiceURI) ||
                  voices.find(v => v.lang.startsWith('en')) ||
                  voices[0];

    if (voice) {
      utterance.voice = voice;
    }

    utterance.onstart = () => {
      this.notifyState(true);
    };

    utterance.onend = () => {
      this.notifyState(false);
      if (onEnd) onEnd();
    };

    utterance.onerror = (e) => {
      console.warn('[ASTRA TTS Warning] Speech synthesis error:', e);
      this.notifyState(false);
      if (onEnd) onEnd();
    };

    this.synth.speak(utterance);
  }

  /**
   * Test Voice Sample Output
   */
  public testVoice(sampleText: string = "Hello Boss, I am ASTRA. Voice output is clear and operational."): void {
    this.speak(sampleText);
  }

  public isSpeaking(): boolean {
    return this.isSpeakingState;
  }
}

export const textToSpeechService = new TextToSpeechService();
