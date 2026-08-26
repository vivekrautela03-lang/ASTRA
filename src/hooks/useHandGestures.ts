import { useState, useEffect, useRef, useCallback } from 'react';
import { handGestureEngine, type GestureData } from '../services/handGestureEngine';

export function useHandGestures(videoActive: boolean) {
  const [gestureData, setGestureData] = useState<GestureData>({
    gesture: 'IDLE',
    label: 'STANDBY',
    rotation: { x: 0, y: 0 },
    scale: 1.0,
    intensityBoost: 0,
    handX: 0.5,
    handY: 0.5,
    confidence: 0
  });

  const [isTrackingEnabled, setIsTrackingEnabled] = useState(true);
  const videoElementRef = useRef<HTMLVideoElement | null>(null);
  const animFrameRef = useRef<number | null>(null);

  // Mouse / Touch fallback dragging state
  const mouseRotationRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const mouseScaleRef = useRef<number>(1.0);
  const isDraggingRef = useRef(false);
  const lastMousePosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  const registerVideoElement = useCallback((video: HTMLVideoElement | null) => {
    videoElementRef.current = video;
  }, []);

  // Frame processing loop
  useEffect(() => {
    if (!videoActive || !isTrackingEnabled) {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      return;
    }

    const processLoop = () => {
      if (videoElementRef.current) {
        const result = handGestureEngine.processVideoFrame(videoElementRef.current);
        
        // Merge with mouse drag offsets
        setGestureData({
          ...result,
          rotation: {
            x: result.rotation.x + mouseRotationRef.current.x,
            y: result.rotation.y + mouseRotationRef.current.y
          },
          scale: result.scale * mouseScaleRef.current
        });
      }
      animFrameRef.current = requestAnimationFrame(processLoop);
    };

    animFrameRef.current = requestAnimationFrame(processLoop);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [videoActive, isTrackingEnabled]);

  // Mouse & Touch interaction handlers for manual control
  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    isDraggingRef.current = true;
    lastMousePosRef.current = { x: e.clientX, y: e.clientY };
  }, []);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDraggingRef.current) return;
    const dx = e.clientX - lastMousePosRef.current.x;
    const dy = e.clientY - lastMousePosRef.current.y;
    lastMousePosRef.current = { x: e.clientX, y: e.clientY };

    mouseRotationRef.current.y += dx * 0.008;
    mouseRotationRef.current.x += dy * 0.008;

    setGestureData((prev) => ({
      ...prev,
      rotation: {
        x: prev.rotation.x + dy * 0.008,
        y: prev.rotation.y + dx * 0.008
      }
    }));
  }, []);

  const handlePointerUp = useCallback(() => {
    isDraggingRef.current = false;
  }, []);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    const delta = e.deltaY * -0.0015;
    mouseScaleRef.current = Math.min(Math.max(mouseScaleRef.current + delta, 0.5), 2.5);
    setGestureData((prev) => ({
      ...prev,
      scale: prev.scale * mouseScaleRef.current
    }));
  }, []);

  const resetTransform = useCallback(() => {
    mouseRotationRef.current = { x: 0, y: 0 };
    mouseScaleRef.current = 1.0;
    handGestureEngine.resetGestures();
    setGestureData({
      gesture: 'IDLE',
      label: 'STANDBY',
      rotation: { x: 0, y: 0 },
      scale: 1.0,
      intensityBoost: 0,
      handX: 0.5,
      handY: 0.5,
      confidence: 0
    });
  }, []);

  return {
    gestureData,
    isTrackingEnabled,
    setIsTrackingEnabled,
    registerVideoElement,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
    handleWheel,
    resetTransform
  };
}

export default useHandGestures;
