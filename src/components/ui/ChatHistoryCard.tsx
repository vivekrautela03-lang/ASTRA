import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Volume2, Trash2, Cpu, Sparkles, X } from 'lucide-react';
import { memoryEngine } from '../../services/memoryEngine';
import { voiceVisionEngine } from '../../services/voiceVisionEngine';
import type { MemoryItem } from '../../types/eva';

interface ChatHistoryCardProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ChatHistoryCard: React.FC<ChatHistoryCardProps> = ({ isOpen, onClose }) => {
  const [memories, setMemories] = useState<MemoryItem[]>([]);

  useEffect(() => {
    if (isOpen) {
      setMemories(memoryEngine.getMemories());
    }
  }, [isOpen]);

  const handleReplayVoice = (text: string) => {
    voiceVisionEngine.speak(text, 'bilingual');
  };

  const handleDeleteItem = (id: string) => {
    memoryEngine.deleteMemory(id);
    setMemories(memoryEngine.getMemories());
  };

  const handleClearAll = () => {
    memoryEngine.clearAllMemories();
    setMemories([]);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative w-full max-w-3xl glass-panel bg-[#020617]/95 border border-cyan-500/30 rounded-3xl p-6 shadow-2xl overflow-hidden max-h-[85vh] flex flex-col font-mono text-white"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-cyan-500/20 pb-4 mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-cyan-500/20 border border-cyan-400/40 text-cyan-300">
                <MessageSquare className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <h3 className="text-base font-bold text-cyan-200 tracking-wider">EVA PERSISTENT CHAT & MEMORY CARDS</h3>
                <p className="text-[11px] text-white/50">Stored interactions, Q&A logs, and learned preferences</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {memories.length > 0 && (
                <button
                  onClick={handleClearAll}
                  className="px-3 py-1.5 rounded-lg bg-red-500/20 text-red-300 border border-red-500/30 hover:bg-red-500/30 transition-colors text-xs flex items-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Clear History
                </button>
              )}
              <button
                onClick={onClose}
                className="p-1.5 rounded-xl bg-white/5 hover:bg-red-500/20 text-white/60 hover:text-red-400 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Memory List Cards Container */}
          <div className="flex-1 overflow-y-auto pr-2 space-y-3.5 scrollbar-thin scrollbar-thumb-cyan-500/30">
            {memories.length === 0 ? (
              <div className="text-center py-12 text-white/40 space-y-2">
                <Sparkles className="w-8 h-8 mx-auto text-cyan-500/50 animate-spin" />
                <p className="text-sm">No persistent chat interactions recorded yet.</p>
              </div>
            ) : (
              memories.map((item) => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="p-4 rounded-2xl glass-card bg-cyan-950/20 border border-cyan-500/20 hover:border-cyan-400/50 transition-all shadow-lg space-y-2"
                >
                  <div className="flex items-center justify-between text-[10px] text-cyan-400">
                    <span className="px-2 py-0.5 rounded bg-cyan-500/20 font-bold uppercase tracking-wider">
                      {item.category}
                    </span>
                    <div className="flex items-center gap-3">
                      <span className="text-white/40">{item.timestamp}</span>
                      <button
                        onClick={() => handleDeleteItem(item.id)}
                        className="text-white/30 hover:text-red-400 transition-colors"
                        title="Delete card"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <p className="text-xs text-white/90 font-sans leading-relaxed font-medium">
                    {item.content}
                  </p>

                  <div className="flex items-center justify-between pt-2 border-t border-white/5 text-[10px]">
                    <div className="flex items-center gap-1.5 text-white/40">
                      <Cpu className="w-3 h-3 text-cyan-400" />
                      <span>Groq / Gemini / DeepSeek AI Engine</span>
                    </div>

                    <button
                      onClick={() => handleReplayVoice(item.content)}
                      className="flex items-center gap-1 px-2.5 py-1 rounded bg-cyan-500/10 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-400/30 transition-colors text-[10px]"
                    >
                      <Volume2 className="w-3 h-3" /> Replay Speech
                    </button>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
