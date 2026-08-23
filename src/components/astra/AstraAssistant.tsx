import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { NebulaOrb } from '../../registry/orbe/nebula-orb/NebulaOrb';
import { AstraWindow } from './AstraWindow';
import { useAstraAssistant, type UseAstraAssistantOptions } from './useAstraAssistant';
import './astra.css';

export interface AstraAssistantProps extends UseAstraAssistantOptions {
  onOpenSettings?: () => void;
  className?: string;
}

export const AstraAssistant: React.FC<AstraAssistantProps> = ({
  onExecuteAction,
  onOpenSettings,
  className = ''
}) => {
  const {
    isOpen,
    orbState,
    userQuery,
    assistantResponse,
    actionButtons,
    statusMessage,
    inputText,
    setInputText,
    levelRef,
    isRecording,
    permissionError,
    openAssistant,
    minimizeAssistant,
    closeAssistant,
    sendPrompt,
    toggleVoice
  } = useAstraAssistant({ onExecuteAction });

  return (
    <div className={`fixed inset-0 pointer-events-none z-[99999] select-none font-sans ${className}`}>
      {/* 1. DEFAULT IDLE STATE — FLOATING SMALL NEBULA ORB (Bottom-Right) */}
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ type: 'spring', damping: 20, stiffness: 260 }}
            className="fixed bottom-7 right-7 pointer-events-auto flex flex-col items-center group cursor-pointer"
            onClick={() => openAssistant(true)}
            title="Ask Astra (Ctrl + Space)"
            role="button"
            aria-label="Activate Astra Assistant"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                openAssistant(true);
              }
            }}
          >
            {/* Tooltip on hover */}
            <div className="absolute -top-9 px-2.5 py-1 rounded-xl bg-black/80 border border-white/10 backdrop-blur-md text-[11px] font-medium text-white/90 shadow-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap">
              Ask Astra <span className="text-white/40 text-[9px] font-mono ml-1">Ctrl+Space</span>
            </div>

            {/* Glowing Backdrop Aura */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-purple-600/40 via-fuchsia-600/30 to-cyan-400/20 blur-xl opacity-75 group-hover:opacity-100 group-hover:scale-125 transition-all duration-500 pointer-events-none -z-10" />

            {/* Small Floating Nebula Orb (64px - 78px) */}
            <div className="w-[72px] h-[72px] rounded-full flex items-center justify-center astra-orb-breathing group-hover:scale-105 transition-transform duration-300">
              <NebulaOrb
                size={72}
                speed={0.8}
                colorFrom="#8b5cf6"
                colorTo="#d946ef"
                state={orbState}
                levelRef={levelRef}
                interactive={false}
              />
            </div>

            {/* Subtle Tiny "ASTRA" Companion Label */}
            <div className="mt-1 flex items-center gap-1 px-2 py-0.5 rounded-full bg-black/40 border border-white/5 backdrop-blur-sm shadow-md">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[9px] font-bold tracking-widest text-white/80 uppercase font-mono group-hover:text-purple-300 transition-colors">
                ASTRA
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 2. EXPANDED ASSISTANT WINDOW (Glassmorphism Floating Desktop Panel) */}
      <AnimatePresence>
        {isOpen && (
          <div className="pointer-events-auto">
            <AstraWindow
              orbState={orbState}
              userQuery={userQuery}
              assistantResponse={assistantResponse}
              actionButtons={actionButtons}
              statusMessage={statusMessage}
              inputText={inputText}
              onInputChange={setInputText}
              onSubmitPrompt={sendPrompt}
              levelRef={levelRef}
              isListening={isRecording}
              onToggleVoice={toggleVoice}
              permissionError={permissionError}
              onMinimize={minimizeAssistant}
              onClose={closeAssistant}
              onOpenSettings={onOpenSettings}
            />
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
