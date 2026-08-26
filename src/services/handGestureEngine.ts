export interface GestureData {
  gesture: 'IDLE' | 'PALM_MOVE' | 'PINCH_ZOOM' | 'FIST_CONDENSE' | 'SWIPE_SPIN';
  label: string;
  rotation: { x: number; y: number };
  scale: number;
  intensityBoost: number;
  handX: number; // 0 to 1
  handY: number; // 0 to 1
  confidence: number;
}

export class HandGestureEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D | null;
  private lastCentroid: { x: number; y: number } | null = null;
  private currentRotation: { x: number; y: number } = { x: 0, y: 0 };
  private currentScale = 1.0;
  private spinVelocity = 0;
  private tiltVelocity = 0;
  private lastTime = performance.now();

  constructor() {
    this.canvas = document.createElement('canvas');
    this.canvas.width = 160;
    this.canvas.height = 120;
    this.ctx = this.canvas.getContext('2d', { willReadFrequently: true });
  }

  public processVideoFrame(video: HTMLVideoElement): GestureData {
    const defaultData: GestureData = {
      gesture: 'IDLE',
      label: 'STANDBY',
      rotation: { ...this.currentRotation },
      scale: this.currentScale,
      intensityBoost: 0,
      handX: 0.5,
      handY: 0.5,
      confidence: 0
    };

    if (!this.ctx || video.readyState < 2 || video.videoWidth === 0) {
      return defaultData;
    }

    const now = performance.now();
    const dt = (now - this.lastTime) / 1000;
    this.lastTime = now;

    const w = this.canvas.width;
    const h = this.canvas.height;

    // Draw video frame to small analysis canvas
    this.ctx.drawImage(video, 0, 0, w, h);
    const imgData = this.ctx.getImageData(0, 0, w, h);
    const data = imgData.data;

    let totalSkinPixels = 0;
    let sumX = 0;
    let sumY = 0;
    let minX = w;
    let maxX = 0;
    let minY = h;
    let maxY = 0;

    // Fast Skin & Motion detection
    for (let y = 0; y < h; y += 2) {
      for (let x = 0; x < w; x += 2) {
        const i = (y * w + x) * 4;
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];

        // Skin color heuristic (RGB bounds)
        const isSkin =
          r > 70 &&
          g > 40 &&
          b > 20 &&
          r > g &&
          r > b &&
          Math.abs(r - g) > 12 &&
          r - g < 150;

        if (isSkin) {
          totalSkinPixels++;
          sumX += x;
          sumY += y;
          if (x < minX) minX = x;
          if (x > maxX) maxX = x;
          if (y < minY) minY = y;
          if (y > maxY) maxY = y;
        }
      }
    }

    // If no sufficient skin area is detected
    if (totalSkinPixels < 35) {
      // Natural spin decay
      this.currentRotation.y += this.spinVelocity * dt;
      this.currentRotation.x += this.tiltVelocity * dt;
      this.spinVelocity *= 0.94;
      this.tiltVelocity *= 0.94;
      this.currentScale += (1.0 - this.currentScale) * 0.05;

      return {
        ...defaultData,
        rotation: { ...this.currentRotation },
        scale: this.currentScale
      };
    }

    const normX = 1 - (sumX / totalSkinPixels) / w; // Inverted for natural mirror interaction
    const normY = (sumY / totalSkinPixels) / h;
    const spreadX = (maxX - minX) / w;
    const spreadY = (maxY - minY) / h;
    const spreadArea = spreadX * spreadY;

    let gesture: GestureData['gesture'] = 'PALM_MOVE';
    let label = '✋ HAND DETECTED: ROTATE';
    let intensityBoost = 0;

    // Movement delta
    let dx = 0;
    let dy = 0;
    if (this.lastCentroid) {
      dx = normX - this.lastCentroid.x;
      dy = normY - this.lastCentroid.y;
    }
    this.lastCentroid = { x: normX, y: normY };

    // Gesture Classification:
    // 1. PINCH / ZOOM (Large hand size change or high area)
    if (spreadArea > 0.18) {
      gesture = 'PINCH_ZOOM';
      label = '🤏 SPREAD: ZOOM IN';
      const targetScale = 1.0 + (spreadArea - 0.18) * 4.5;
      this.currentScale += (Math.min(targetScale, 2.4) - this.currentScale) * 0.15;
    } else if (spreadArea < 0.06 && totalSkinPixels > 40) {
      // 2. FIST / CONDENSE
      gesture = 'FIST_CONDENSE';
      label = '✊ FIST: CONDENSE ENERGY';
      this.currentScale += (0.65 - this.currentScale) * 0.18;
      intensityBoost = 1.5;
    } else if (Math.abs(dx) > 0.06 || Math.abs(dy) > 0.06) {
      // 3. FAST SWIPE: SPIN & TILT
      gesture = 'SWIPE_SPIN';
      label = '🔄 SWIPE: ORBITAL SPIN';
      this.spinVelocity = dx * 18;
      this.tiltVelocity = dy * 14;
    } else {
      // 4. PALM ROTATE & TILT
      gesture = 'PALM_MOVE';
      label = '✋ PALM: 3D ROTATION';
      this.currentRotation.y += (normX - 0.5) * 2.8 * dt;
      this.currentRotation.x += (normY - 0.5) * 2.2 * dt;
    }

    // Apply spin and tilt velocity
    this.currentRotation.y += this.spinVelocity * dt;
    this.currentRotation.x += this.tiltVelocity * dt;
    this.spinVelocity *= 0.92;
    this.tiltVelocity *= 0.92;

    return {
      gesture,
      label,
      rotation: { ...this.currentRotation },
      scale: this.currentScale,
      intensityBoost,
      handX: normX,
      handY: normY,
      confidence: Math.min(totalSkinPixels / 150, 1.0)
    };
  }

  public resetGestures() {
    this.currentRotation = { x: 0, y: 0 };
    this.currentScale = 1.0;
    this.spinVelocity = 0;
    this.tiltVelocity = 0;
  }
}

export const handGestureEngine = new HandGestureEngine();
export default handGestureEngine;
