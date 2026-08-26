import React, { useEffect, useRef } from 'react';

interface LiquidGlassBackgroundProps {
  className?: string;
}

export const LiquidGlassBackground: React.FC<LiquidGlassBackgroundProps> = ({ className = '' }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // Liquid glass caustic blobs
    const blobs = [
      { x: width * 0.5, y: height * 0.45, r: 360, color: 'rgba(0, 191, 255, 0.09)', vx: 0.3, vy: 0.2, phase: 0 },
      { x: width * 0.25, y: height * 0.6, r: 300, color: 'rgba(99, 216, 255, 0.05)', vx: -0.25, vy: 0.35, phase: 2 },
      { x: width * 0.75, y: height * 0.4, r: 320, color: 'rgba(138, 43, 226, 0.05)', vx: 0.2, vy: -0.3, phase: 4 },
      { x: width * 0.5, y: height * 0.8, r: 280, color: 'rgba(0, 229, 255, 0.06)', vx: -0.15, vy: -0.2, phase: 1 },
    ];

    let t = 0;

    const render = () => {
      animId = requestAnimationFrame(render);
      t += 0.008;

      // Pure pitch black base
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, width, height);

      // Render morphing liquid glass refractive blobs
      blobs.forEach((b) => {
        const cx = b.x + Math.sin(t + b.phase) * 60;
        const cy = b.y + Math.cos(t * 0.8 + b.phase) * 45;
        const radius = b.r + Math.sin(t * 1.2 + b.phase) * 30;

        const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
        grad.addColorStop(0, b.color);
        grad.addColorStop(0.5, b.color.replace(/[\d.]+\)$/, '0.03)'));
        grad.addColorStop(1, 'rgba(0, 0, 0, 0)');

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(cx, cy, radius, 0, Math.PI * 2);
        ctx.fill();
      });

      // Subtle dynamic glass caustic grid lines
      ctx.lineWidth = 0.5;
      const spacing = 70;
      for (let x = 0; x < width; x += spacing) {
        const offset = Math.sin(t + x * 0.005) * 8;
        ctx.strokeStyle = `rgba(255, 255, 255, ${0.012 + Math.sin(t + x * 0.01) * 0.006})`;
        ctx.beginPath();
        ctx.moveTo(x + offset, 0);
        ctx.lineTo(x - offset, height);
        ctx.stroke();
      }

      for (let y = 0; y < height; y += spacing) {
        const offset = Math.cos(t + y * 0.005) * 8;
        ctx.strokeStyle = `rgba(0, 191, 255, ${0.012 + Math.cos(t + y * 0.01) * 0.006})`;
        ctx.beginPath();
        ctx.moveTo(0, y + offset);
        ctx.lineTo(width, y - offset);
        ctx.stroke();
      }
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animId);
    };
  }, []);

  return (
    <div className={`pointer-events-none absolute inset-0 z-0 overflow-hidden ${className}`}>
      {/* Dynamic Refractive Canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />

      {/* Liquid Glass Frosted Sheen Layer */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/[0.02] via-transparent to-black/60 backdrop-blur-[60px]" />
    </div>
  );
};

export default LiquidGlassBackground;
