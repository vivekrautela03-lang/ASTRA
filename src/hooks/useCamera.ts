import { useState, useEffect, useCallback, useRef } from 'react';

export function useCamera() {
  const [isActive, setIsActive] = useState(false);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsActive(false);
  }, []);

  const startCamera = useCallback(async () => {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1920 },
          height: { ideal: 1080 },
          facingMode: 'user'
        },
        audio: false
      });

      streamRef.current = stream;
      setHasPermission(true);
      setIsActive(true);

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play().catch(() => {});
      }
      return true;
    } catch (err) {
      console.warn('[CAMERA HOOK]: Access denied or camera unavailable:', err);
      setHasPermission(false);
      setIsActive(false);
      setError('Camera access denied. Please grant permission in browser settings.');
      return false;
    }
  }, []);

  const toggleCamera = useCallback(() => {
    if (isActive) {
      stopCamera();
    } else {
      startCamera();
    }
  }, [isActive, startCamera, stopCamera]);

  useEffect(() => {
    // Attempt automatic activation on mount
    startCamera();

    return () => {
      stopCamera();
    };
  }, [startCamera, stopCamera]);

  // Bind video element when ref connects
  const bindVideoRef = useCallback((el: HTMLVideoElement | null) => {
    videoRef.current = el;
    if (el && streamRef.current) {
      el.srcObject = streamRef.current;
      el.play().catch(() => {});
    }
  }, []);

  return {
    isActive,
    hasPermission,
    error,
    startCamera,
    stopCamera,
    toggleCamera,
    bindVideoRef
  };
}

export default useCamera;
