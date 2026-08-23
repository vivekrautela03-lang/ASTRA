import React from 'react';
import { motion } from 'framer-motion';
import { NebulaOrb } from '../../registry/orbe/nebula-orb/NebulaOrb';
import type { OrbState } from '../../registry/orbe/nebula-orb/types';
import { AstraHeader } from './AstraHeader';
import { AstraStatus } from './AstraStatus';
import { AstraResponse } from './AstraResponse';
import { AstraInput } from './AstraInput';
import type { ActionButton } from './useAstraAssistant';

export interface AstraWindowProps {
  orbState: OrbState;
  userQuery: string | null;
  assistantResponse: string | null;
  actionButtons: ActionButton[];
  statusMessage: string;
  inputText: string;
  onInputChange: (text: string) => void;
  onSubmitPrompt: (prompt: string) => void;
  levelRef?: React.MutableRefObject<number>;
  isListening: boolean;
  onToggleVoice: () => void;
  permissionError: string | null;
  onMinimize: () => void;
  onClose: () => void;
  onOpenSettings?: () => void;
}

export const AstraWindow: React.FC<AstraWindowProps> = ({
  orbState,
  userQuery,
  assistantResponse,
  actionButtons,
  statusMessage,
  inputText,
  onInputChange,
  onSubmitPrompt,
  levelRef,
  isListening,
  onToggleVoice,
  permissionError,
  onMinimize,
  onClose,
  onOpenSettings
}) => {
  return (
    <motion.div
      drag
      dragMomentum={false}
      dragElastic={0.08}
      initial={{ opacity: 0, scale: 0.92, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.92, y: 20 }}
      transition={{ type: 'spring', damping: 25, stiffness: 300 }}
      className="fixed bottom-7 right-7 z-[99999] w-[min(92vw,480px)] h-[min(82vh,640px)] flex flex-col rounded-3xl astra-glass-panel overflow-hidden select-none font-sans"
      style={{
        touchAction: 'none'
      }}
    >
      {/* 1. Header with Drag Handle & Window Controls */}
      <AstraHeader
        onMinimize={onMinimize}
        onClose={onClose}
        onOpenSettings={onOpenSettings}
      />

      {/* 2. Main Central Area (Nebula Orb + Status + Response) */}
      <div className="flex-1 flex flex-col items-center justify-between p-2 overflow-hidden">
        {/* Central Orb Display */}
        <div className="relative flex flex-col items-center justify-center my-auto">
          {/* Subtle Ambient Glow Behind Orb */}
          <div className="absolute w-44 h-44 rounded-full bg-gradient-to-tr from-purple-600/30 via-fuchsia-600/20 to-cyan-500/20 blur-2xl pointer-events-none -z-10 animate-pulse" />

          <NebulaOrb
            size={184}
            speed={1}
            colorFrom="#8b5cf6"
            colorTo="#d946ef"
            levelRef={levelRef}
            state={orbState}
            onClick={onToggleVoice}
            interactive={true}
          />

          {/* Accessible Status Text Beneath Orb */}
          <AstraStatus
            orbState={orbState}
            statusMessage={statusMessage}
            className="mt-1"
          />
        </div>

        {/* Dynamic Compact Response Area (If conversation is ongoing) */}
        {(userQuery || assistantResponse) && (
          <AstraResponse
            userQuery={userQuery}
            response={assistantResponse}
            actionButtons={actionButtons}
            className="mb-1"
          />
        )}
      </div>

      {/* 3. Text & Voice Input Field (Always accessible at bottom) */}
      <AstraInput
        value={inputText}
        onChange={onInputChange}
        onSubmit={onSubmitPrompt}
        isListening={isListening}
        onToggleVoice={onToggleVoice}
        permissionError={permissionError}
      />
    </motion.div>
  );
};
