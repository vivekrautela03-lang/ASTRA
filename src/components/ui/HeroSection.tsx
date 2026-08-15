import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, ArrowDown } from 'lucide-react';
import type { PromptSuggestion } from '../../types/eva';

interface HeroSectionProps {
  onSelectSuggestion: (prompt: string) => void;
  onScrollDown: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onSelectSuggestion, onScrollDown }) => {
  const suggestions: PromptSuggestion[] = [
    { id: '1', label: 'Synthesize neural workflows', category: 'Intelligence', prompt: 'Synthesize autonomous neural agent workflows for real-time task orchestration.' },
    { id: '2', label: 'Analyze spatial architecture', category: 'Spatial', prompt: 'Analyze spatial 3D WebGL architecture and optimize GPU rendering pipelines.' },
    { id: '3', label: 'Create autonomous pipelines', category: 'Automation', prompt: 'Create automated subagents for continuous system diagnostics and security.' },
  ];

  return (
    <section className="relative w-full h-screen flex flex-col justify-between pt-32 pb-16 px-4 md:px-12 text-center pointer-events-none select-none">
      {/* Center Main Heading Typography Reveal */}
      <div className="mt-auto md:mt-12 max-w-4xl mx-auto flex flex-col items-center">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="inline-flex items-center gap-2 mb-3"
        >
          <span className="text-[11px] uppercase tracking-widest text-cyan-400 font-semibold font-mono px-3.5 py-1 rounded-full bg-cyan-950/40 border border-cyan-500/20 backdrop-blur-md">
            APPLE × AWWWARDS DIGITAL OS
          </span>
        </motion.div>

        {/* Large Masked Typography */}
        <motion.h1
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.0, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-white mb-4 text-aurora font-heading leading-tight"
        >
          DIGITAL CONSCIOUSNESS
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="text-sm md:text-lg text-white/60 font-light mb-8 max-w-xl"
        >
          EVA lives inside your system as a real-time holographic intelligence. Always aware, thinking, and evolving.
        </motion.p>

        {/* Prompt Suggestion Chips */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-wrap items-center justify-center gap-2.5 max-w-2xl pointer-events-auto"
        >
          {suggestions.map((item) => (
            <button
              key={item.id}
              onClick={() => onSelectSuggestion(item.prompt)}
              className="group glass-pill px-4 py-2 rounded-full text-xs text-white/70 hover:text-white transition-all flex items-center gap-2 hover:scale-[1.02] active:scale-95 border border-white/10 hover:border-cyan-400/30 magnetic-target"
            >
              <Sparkles className="w-3.5 h-3.5 text-cyan-400 opacity-60 group-hover:opacity-100 transition-opacity" />
              <span>{item.label}</span>
            </button>
          ))}
        </motion.div>
      </div>

      {/* Bottom Scroll Down Hint */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.0, delay: 1.2 }}
        onClick={onScrollDown}
        className="pointer-events-auto cursor-pointer flex flex-col items-center gap-1.5 text-white/40 hover:text-white transition-colors mx-auto mt-4"
      >
        <span className="text-[10px] font-mono tracking-widest uppercase">Explore System</span>
        <ArrowDown className="w-4 h-4 animate-bounce text-cyan-400" />
      </motion.div>
    </section>
  );
};
