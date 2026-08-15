export type ClapEvent = 'single' | 'double' | 'triple';

export class ClapDetectionEngine {
  private audioCtx: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private micStream: MediaStream | null = null;
  private isListening: boolean = false;
  private clapTimes: number[] = [];
  private sensitivity: number = 75; // 0 - 100
  private onClapCallback?: (event: ClapEvent) => void;
  private animFrameId: number | null = null;

  public async start(sensitivity: number = 75, onClap?: (event: ClapEvent) => void): Promise<boolean> {
    if (this.isListening) return true;
    this.sensitivity = sensitivity;
    this.onClapCallback = onClap;

    console.warn('[EV Clap Engine] Microphone detection disabled; no permission request will occur.');
    return false;
  }

  public stop(): void {
    this.isListening = false;
    if (this.animFrameId) cancelAnimationFrame(this.animFrameId);
    if (this.micStream) {
      this.micStream.getTracks().forEach(t => t.stop());
      this.micStream = null;
    }
    if (this.audioCtx) {
      this.audioCtx.close();
      this.audioCtx = null;
    }
  }

  public setSensitivity(val: number): void {
    this.sensitivity = val;
  }

  private detectLoop = (): void => {
    if (!this.isListening || !this.analyser) return;

    const dataArray = new Uint8Array(this.analyser.frequencyBinCount);
    this.analyser.getByteFrequencyData(dataArray);

    // Calculate RMS volume peak
    let sum = 0;
    for (let i = 0; i < dataArray.length; i++) {
      sum += dataArray[i] * dataArray[i];
    }
    const rms = Math.sqrt(sum / dataArray.length);

    // Calculate dynamic threshold based on sensitivity slider (0-100)
    const threshold = 180 - (this.sensitivity * 1.2); 

    const now = performance.now();

    if (rms > threshold) {
      // Debounce rapid mic spikes within 150ms
      const lastClap = this.clapTimes[this.clapTimes.length - 1] || 0;
      if (now - lastClap > 150) {
        this.clapTimes.push(now);
        this.evaluateClaps();
      }
    }

    this.animFrameId = requestAnimationFrame(this.detectLoop);
  };

  private evaluateClaps(): void {
    // Retain claps within 1000ms window
    const now = performance.now();
    this.clapTimes = this.clapTimes.filter(t => now - t <= 1000);

    const count = this.clapTimes.length;

    // Trigger after a 400ms pause to accurately count single, double, or triple claps
    setTimeout(() => {
      if (this.clapTimes.length === count && count > 0) {
        if (count === 1) {
          if (this.onClapCallback) this.onClapCallback('single');
        } else if (count === 2) {
          if (this.onClapCallback) this.onClapCallback('double');
        } else if (count >= 3) {
          if (this.onClapCallback) this.onClapCallback('triple');
        }
        this.clapTimes = [];
      }
    }, 350);
  }
}

export const clapDetectionEngine = new ClapDetectionEngine();
