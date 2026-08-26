import { useState, useEffect, useRef } from 'react';

export function useAudioVisualizer(active: boolean = false) {
  const [level, setLevel] = useState(0);
  const animFrameRef = useRef<number | null>(null);

  useEffect(() => {
    if (!active) {
      setLevel(0);
      return;
    }

    let phase = 0;
    const loop = () => {
      phase += 0.05;
      // Procedural synthetic energy pulse if mic not actively feeding
      const mockLevel = Math.sin(phase) * 0.25 + 0.35;
      setLevel(mockLevel);
      animFrameRef.current = requestAnimationFrame(loop);
    };

    loop();

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [active]);

  return level;
}

export default useAudioVisualizer;
