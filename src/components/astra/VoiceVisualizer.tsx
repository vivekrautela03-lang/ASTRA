import React, { useEffect, useRef } from 'react';
import type { AstraOrbState } from './AstraOrb';

interface VoiceVisualizerProps {
  state: AstraOrbState;
  audioLevel?: number;
  size?: number;
  className?: string;
}

export const VoiceVisualizer: React.FC<VoiceVisualizerProps> = ({
  state,
  audioLevel = 0,
  size = 520,
  className = ''
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioLevelRef = useRef<number>(audioLevel);
  const stateRef = useRef<AstraOrbState>(state);

  useEffect(() => {
    audioLevelRef.current = audioLevel;
  }, [audioLevel]);

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let phase = 0;

    const render = () => {
      animId = requestAnimationFrame(render);
      phase += 0.04;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const baseRadius = (canvas.width / 2) * 0.72;
      const level = audioLevelRef.current || 0;
      const isListening = String(stateRef.current).toUpperCase().includes('LISTEN');
      const isSpeaking = String(stateRef.current).toUpperCase().includes('SPEAK');
      const isThinking = String(stateRef.current).toUpperCase().includes('THINK');

      const waveCount = isListening || isSpeaking ? 3 : 1;
      const maxAmplitude = (isListening || isSpeaking ? 16 + level * 28 : 5);

      for (let w = 0; w < waveCount; w++) {
        ctx.beginPath();
        const segments = 120;
        const offsetPhase = phase + (w * Math.PI) / waveCount;
        const currentRadius = baseRadius + (w - 1) * 8;

        for (let i = 0; i <= segments; i++) {
          const angle = (i / segments) * Math.PI * 2;
          const harmonic =
            Math.sin(angle * 6 + offsetPhase) * (maxAmplitude * 0.6) +
            Math.sin(angle * 12 - offsetPhase * 1.5) * (maxAmplitude * 0.4);

          const r = currentRadius + harmonic;
          const x = centerX + Math.cos(angle) * r;
          const y = centerY + Math.sin(angle) * r;

          if (i === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }
        ctx.closePath();

        const alpha = isListening
          ? 0.45 - w * 0.12
          : isSpeaking
          ? 0.5 - w * 0.15
          : isThinking
          ? 0.25
          : 0.15;

        const strokeColor = isThinking
          ? `rgba(168, 85, 247, ${alpha})`
          : isListening
          ? `rgba(0, 229, 255, ${alpha})`
          : `rgba(0, 191, 255, ${alpha})`;

        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = 1.5 + (1 - w * 0.3) * (level * 2);
        ctx.shadowBlur = 12 + level * 10;
        ctx.shadowColor = isThinking ? '#a855f7' : '#00bfff';
        ctx.stroke();
      }
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      width={size}
      height={size}
      className={`pointer-events-none absolute inset-0 z-0 ${className}`}
    />
  );
};

export default VoiceVisualizer;
