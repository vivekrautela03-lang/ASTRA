import { useEffect, useRef, useState, useCallback } from 'react';

export interface UseAudioLevelOptions {
  fftSize?: number;
  smoothingTimeConstant?: number;
  minDecibels?: number;
  maxDecibels?: number;
  onPermissionDenied?: (error: Error) => void;
}

export interface UseAudioLevelReturn {
  levelRef: React.MutableRefObject<number>;
  isRecording: boolean;
  permissionError: string | null;
  startListening: () => Promise<boolean>;
  stopListening: () => void;
  toggleListening: () => Promise<boolean>;
}

export function useAudioLevel(options: UseAudioLevelOptions = {}): UseAudioLevelReturn {
  const {
    fftSize = 256,
    smoothingTimeConstant = 0.8,
    minDecibels = -90,
    maxDecibels = -10,
    onPermissionDenied
  } = options;

  const levelRef = useRef<number>(0);
  const [isRecording, setIsRecording] = useState(false);
  const [permissionError, setPermissionError] = useState<string | null>(null);

  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  const stopListening = useCallback(() => {
    if (animationFrameRef.current !== null) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }

    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }

    analyserRef.current = null;
    levelRef.current = 0;
    setIsRecording(false);
  }, []);

  const startListening = useCallback(async (): Promise<boolean> => {
    stopListening();
    setPermissionError(null);

    if (typeof window === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
      const err = 'Audio input is not supported in this environment.';
      setPermissionError(err);
      return false;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });

      streamRef.current = stream;
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const audioContext = new AudioCtx();
      audioContextRef.current = audioContext;

      if (audioContext.state === 'suspended') {
        await audioContext.resume();
      }

      const analyser = audioContext.createAnalyser();
      analyser.fftSize = fftSize;
      analyser.smoothingTimeConstant = smoothingTimeConstant;
      analyser.minDecibels = minDecibels;
      analyser.maxDecibels = maxDecibels;
      analyserRef.current = analyser;

      const source = audioContext.createMediaStreamSource(stream);
      source.connect(analyser);

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      const updateLevel = () => {
        if (!analyserRef.current) return;
        analyserRef.current.getByteFrequencyData(dataArray);

        let sum = 0;
        for (let i = 0; i < bufferLength; i++) {
          sum += dataArray[i];
        }
        const average = sum / bufferLength;
        const normalized = Math.min(1, Math.max(0, average / 128));

        // Exponential smoothing for organic reactive pulsing
        levelRef.current = levelRef.current * 0.7 + normalized * 0.3;

        animationFrameRef.current = requestAnimationFrame(updateLevel);
      };

      setIsRecording(true);
      updateLevel();
      return true;
    } catch (err: unknown) {
      const errorObj = err instanceof Error ? err : new Error(String(err));
      let userMsg = 'Microphone access is required for voice input.';
      if (errorObj.name === 'NotAllowedError' || errorObj.name === 'PermissionDeniedError') {
        userMsg = 'Microphone permission was denied. Please allow microphone access.';
      } else if (errorObj.name === 'NotFoundError' || errorObj.name === 'DevicesNotFoundError') {
        userMsg = 'No microphone device found on this system.';
      }
      setPermissionError(userMsg);
      if (onPermissionDenied) onPermissionDenied(errorObj);
      stopListening();
      return false;
    }
  }, [fftSize, smoothingTimeConstant, minDecibels, maxDecibels, onPermissionDenied, stopListening]);

  const toggleListening = useCallback(async () => {
    if (isRecording) {
      stopListening();
      return false;
    } else {
      return await startListening();
    }
  }, [isRecording, startListening, stopListening]);

  useEffect(() => {
    return () => {
      stopListening();
    };
  }, [stopListening]);

  return {
    levelRef,
    isRecording,
    permissionError,
    startListening,
    stopListening,
    toggleListening
  };
}
