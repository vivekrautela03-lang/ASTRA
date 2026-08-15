import type { VisionDetection } from '../types/eva';
import { jarvisSoundEngine } from './jarvisSoundEngine';

export class VoiceVisionEngine {
  public listeningActive: boolean = false;
  public wakeWordActive: boolean = false;
  private synth: SpeechSynthesis | null = typeof window !== 'undefined' ? window.speechSynthesis : null;
  private recognition: any = null;
  private wakeWordRecognition: any = null;
  private silenceTimer: any = null;

  constructor() {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        this.recognition = new SpeechRecognition();
        this.recognition.continuous = true;
        this.recognition.interimResults = true;
        this.recognition.lang = 'en-US';

        this.wakeWordRecognition = new SpeechRecognition();
        this.wakeWordRecognition.continuous = true;
        this.wakeWordRecognition.interimResults = true;
        this.wakeWordRecognition.lang = 'en-US';
      }

      // Pre-fetch voices
      if (this.synth && this.synth.onvoiceschanged !== undefined) {
        this.synth.onvoiceschanged = () => {
          this.synth?.getVoices();
        };
      }
    }
  }

  /**
   * Get natural human time-based greeting for ASTRA AI
   */
  public getGreeting(): string {
    const hour = new Date().getHours();
    let timeGreeting = 'Good morning';
    if (hour >= 12 && hour < 17) {
      timeGreeting = 'Good afternoon';
    } else if (hour >= 17 || hour < 4) {
      timeGreeting = 'Good evening';
    }
    return `${timeGreeting}, Vivek! ASTRA here. Ready to assist you with coding, research, writing, or planning today. How can I help?`;
  }

  /**
   * Clean text string for natural TTS reading (removes code blocks, markdown syntax)
   */
  public cleanTextForSpeech(text: string): string {
    return text
      .replace(/```[\s\S]*?```/g, 'I have generated the code script for you on screen.')
      .replace(/`([^`]+)`/g, '$1')
      .replace(/[*_~#>-]/g, ' ')
      .replace(/\[(.*?)\]\((.*?)\)/g, '$1')
      .replace(/\s+/g, ' ')
      .trim();
  }

  /**
   * High quality TTS Speech Synthesis with natural articulate human voice selection
   */
  public speak(text: string, _language: 'en' | 'hi' | 'bilingual' = 'bilingual', onEnd?: () => void): void {
    if (!this.synth) {
      if (onEnd) onEnd();
      return;
    }

    // Cancel any previous audio queue to prevent stuttering
    this.synth.cancel();
    jarvisSoundEngine.playClick();

    const cleanText = this.cleanTextForSpeech(text);
    if (!cleanText) {
      if (onEnd) onEnd();
      return;
    }

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1.0;
    utterance.pitch = 1.05; // Articulate, calm, natural human pitch
    utterance.volume = 1.0;

    const voices = this.synth.getVoices();
    // Select premium articulate voice (Google US/UK, Samantha, Victoria, Zira, Karen)
    const femaleVoice = voices.find(v => 
      (v.name.includes('Google') && (v.name.includes('UK') || v.name.includes('US'))) ||
      v.name.includes('Samantha') || 
      v.name.includes('Victoria') || 
      v.name.includes('Zira') || 
      v.name.includes('Karen')
    ) || voices.find(v => v.lang.startsWith('en')) || voices[0];

    if (femaleVoice) {
      utterance.voice = femaleVoice;
    }

    utterance.onend = () => {
      if (onEnd) onEnd();
    };

    utterance.onerror = (e) => {
      console.warn('[ASTRA TTS Warning] Speech synthesis interrupted:', e);
      this.synth?.cancel();
      if (onEnd) onEnd();
    };

    this.synth.speak(utterance);
  }

  /**
   * Stop active speech synthesis
   */
  public stopSpeaking(): void {
    if (this.synth) {
      this.synth.cancel();
    }
  }

  /**
   * Continuous Speech Recognition Listener
   */
  public startListening(onResult: (transcript: string, isFinal: boolean) => void): void {
    if (!this.recognition) {
      console.warn('[ASTRA Speech Recognition] Web Speech API unavailable');
      return;
    }

    try {
      this.stopWakeWordListener();
      this.stopSpeaking();
      jarvisSoundEngine.playHologramActivation();
      this.listeningActive = true;

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

        if (final) {
          onResult(final, true);
        } else if (interim) {
          onResult(interim, false);
          if (this.silenceTimer) clearTimeout(this.silenceTimer);
          this.silenceTimer = setTimeout(() => {
            onResult(interim, true);
          }, 1800);
        }
      };

      this.recognition.onerror = (event: any) => {
        console.warn('[ASTRA STT Error]:', event.error);
        this.listeningActive = false;
      };

      this.recognition.onend = () => {
        if (this.listeningActive) {
          try { this.recognition.start(); } catch { /* Ignore restart errors */ }
        }
      };

      this.recognition.start();
    } catch (e) {
      console.warn('[ASTRA STT Listener Exception]', e);
    }
  }

  /**
   * Stop listening
   */
  public stopListening(): void {
    this.listeningActive = false;
    if (this.recognition) {
      try {
        this.recognition.stop();
      } catch {
        // Ignore
      }
    }
  }

  /**
   * Wake-Word Background Listener ("Hey ASTRA" / "ASTRA" / "FRIDAY" / "Computer")
   */
  public startWakeWordListener(onWakeWordDetected: () => void): void {
    if (!this.wakeWordRecognition || this.listeningActive) return;

    try {
      this.wakeWordActive = true;
      this.wakeWordRecognition.onresult = (event: any) => {
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const transcript = event.results[i][0].transcript.toLowerCase();
          if (
            transcript.includes('astra') || 
            transcript.includes('hey astra') || 
            transcript.includes('friday') || 
            transcript.includes('eva') || 
            transcript.includes('wake up') || 
            transcript.includes('computer')
          ) {
            this.stopWakeWordListener();
            jarvisSoundEngine.playHologramActivation();
            onWakeWordDetected();
            break;
          }
        }
      };

      this.wakeWordRecognition.onend = () => {
        if (this.wakeWordActive && !this.listeningActive) {
          try { this.wakeWordRecognition.start(); } catch { /* Ignore */ }
        }
      };

      this.wakeWordRecognition.start();
    } catch {
      // Background listener silent catch
    }
  }

  public stopWakeWordListener(): void {
    this.wakeWordActive = false;
    if (this.wakeWordRecognition) {
      try {
        this.wakeWordRecognition.stop();
      } catch {
        // Ignore
      }
    }
  }

  public getLiveDetections(): VisionDetection[] {
    return [
      { id: 'det-1', label: 'Vivek (User Face)', confidence: 0.99, bbox: [200, 150, 420, 480], category: 'person' },
      { id: 'det-2', label: 'Primary Workstation Screen', confidence: 0.96, bbox: [50, 50, 1200, 700], category: 'interface' },
      { id: 'det-3', label: 'ASTRA 3D Grid Core', confidence: 0.98, bbox: [600, 100, 1000, 750], category: 'hologram' }
    ];
  }
}

export const voiceVisionEngine = new VoiceVisionEngine();
