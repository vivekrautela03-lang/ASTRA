export interface CameraState {
  active: boolean;
  permissionGranted: boolean;
  error: string | null;
  stream: MediaStream | null;
}

export class CameraTool {
  public name = 'CameraTool';
  public description = 'Access browser secure camera stream via getUserMedia for video preview and frame capture';
  private currentStream: MediaStream | null = null;

  public async startCamera(): Promise<CameraState> {
    if (typeof window === 'undefined' || !navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      return {
        active: false,
        permissionGranted: false,
        error: 'MediaDevices camera API is unavailable in this browser environment.',
        stream: null
      };
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: 'user' },
        audio: false
      });
      this.currentStream = stream;
      return {
        active: true,
        permissionGranted: true,
        error: null,
        stream
      };
    } catch (err: any) {
      const errorMsg = err?.name === 'NotAllowedError'
        ? 'Camera permission denied by user browser settings.'
        : `Camera access error: ${err?.message || 'Unable to access webcam'}`;
      return {
        active: false,
        permissionGranted: false,
        error: errorMsg,
        stream: null
      };
    }
  }

  public stopCamera(): void {
    if (this.currentStream) {
      this.currentStream.getTracks().forEach(track => track.stop());
      this.currentStream = null;
    }
  }

  public captureFrame(videoElement: HTMLVideoElement): string | null {
    if (!videoElement || !videoElement.videoWidth) return null;
    const canvas = document.createElement('canvas');
    canvas.width = videoElement.videoWidth;
    canvas.height = videoElement.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL('image/jpeg', 0.85);
  }
}

export const cameraTool = new CameraTool();
