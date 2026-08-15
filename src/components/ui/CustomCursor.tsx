import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

export const CustomCursor: React.FC = () => {
  const [position, setPosition] = useState({ x: -100, y: -100 });
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });

      // Detect hover over interactive buttons or cards
      const target = e.target as HTMLElement;
      if (target.closest('button') || target.closest('a') || target.closest('.magnetic-target')) {
        setIsHovered(true);
      } else {
        setIsHovered(false);
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden hidden md:block">
      {/* Outer Magnetic Glow Ring */}
      <motion.div
        animate={{
          x: position.x - (isHovered ? 24 : 16),
          y: position.y - (isHovered ? 24 : 16),
          scale: isHovered ? 1.5 : 1,
        }}
        transition={{ type: 'spring', stiffness: 500, damping: 28, mass: 0.5 }}
        className={`w-8 h-8 rounded-full border ${
          isHovered ? 'border-cyan-400 bg-cyan-400/15 shadow-[0_0_20px_#00f0ff]' : 'border-white/30'
        } backdrop-blur-xs`}
      />

      {/* Inner Pupil Dot */}
      <motion.div
        animate={{
          x: position.x - 3,
          y: position.y - 3,
        }}
        transition={{ type: 'spring', stiffness: 800, damping: 35 }}
        className="w-1.5 h-1.5 rounded-full bg-cyan-300 shadow-[0_0_8px_#00f0ff]"
      />
    </div>
  );
};
