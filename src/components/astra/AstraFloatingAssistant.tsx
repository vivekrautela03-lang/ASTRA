import React, { useState, useEffect, useRef, useCallback } from 'react';
import { AstraOrb, type AstraOrbState } from './AstraOrb';
import { VoiceVisualizer } from './VoiceVisualizer';
import { AstraLogo } from './AstraLogo';
import { CommandBar } from './CommandBar';
import { onAstraEvent, handleAstraEvent } from '../../services/astraEvents';
import { X, Mic, Volume2 } from 'lucide-react';

interface AstraFloatingAssistantProps {
  state: AstraOrbState;
  statusText: string;
  audioLevel: number;
  isRecording: boolean;
  onSend: (text: string) => void;
  onToggleVoice: () => void;
  onStateChange: (state: AstraOrbState, status?: string) => void;
  activeResponseText?: string | null;
  className?: string;
}

export const AstraFloatingAssistant: React.FC<AstraFloatingAssistantProps> = ({
  state,
  statusText,
  audioLevel,
  isRecording,
  onSend,
  onToggleVoice,
  onStateChange,
  activeResponseText,
  className = ''
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [animStage, setAnimStage] = useState<'idle' | 'waking' | 'active' | 'exiting'>('idle');
  const exitTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleDismiss = useCallback(() => {
    setAnimStage('exiting');
    setTimeout(() => {
      setIsVisible(false);
      setAnimStage('idle');
      onStateChange('IDLE', 'ONLINE • READY');
    }, 450);
  }, [onStateChange]);

  // Subscribe to ASTRA Event Bus (Wake Word, Manual Trigger, Keyboard, External IPC)
  useEffect(() => {
    const unsubscribe = onAstraEvent((event) => {
      if (event.type === 'wake_detected' || event.type === 'manual_wake') {
        if (exitTimeoutRef.current) clearTimeout(exitTimeoutRef.current);

        // 1. Enter WAKING stage
        setIsVisible(true);
        setAnimStage('waking');
        onStateChange('WAKING', 'WAKING ASTRA...');

        // 2. Smoothly transition to LISTENING after wake animation (600ms)
        setTimeout(() => {
          setAnimStage('active');
          onStateChange('LISTENING', 'ASTRA IS LISTENING...');
          if (!isRecording) {
            onToggleVoice();
          }
        }, 650);
      } else if (event.type === 'wake_cancel') {
        handleDismiss();
      } else if (event.type === 'response_finished') {
        // Schedule graceful exit transition
        exitTimeoutRef.current = setTimeout(() => {
          handleDismiss();
        }, 2200);
      } else if (event.type === 'state_change' && event.payload?.state) {
        onStateChange(event.payload.state, event.payload.status);
      }
    });

    return () => {
      unsubscribe();
      if (exitTimeoutRef.current) clearTimeout(exitTimeoutRef.current);
    };
  }, [onStateChange, isRecording, onToggleVoice, handleDismiss]);

  // Sync internal visibility with external state changes
  useEffect(() => {
    const upper = String(state).toUpperCase();
    if (upper === 'WAKING') {
      setIsVisible(true);
      setAnimStage('waking');
    } else if (upper === 'LISTENING' || upper === 'THINKING' || upper === 'SPEAKING' || upper === 'PROCESSING') {
      setIsVisible(true);
      setAnimStage('active');
    } else if (upper === 'IDLE' && isVisible && animStage !== 'waking') {
      // Auto-exit if idle for a few moments
      if (exitTimeoutRef.current) clearTimeout(exitTimeoutRef.current);
      exitTimeoutRef.current = setTimeout(() => {
        handleDismiss();
      }, 3000);
    }
  }, [state, isVisible, animStage, handleDismiss]);

  const handleManualWake = () => {
    handleAstraEvent({ type: 'manual_wake', payload: { source: 'floating_pill' } });
  };

  const handleCommandSend = (text: string) => {
    if (exitTimeoutRef.current) clearTimeout(exitTimeoutRef.current);
    onSend(text);
  };

  return (
    <>
      {/* 1. Ambient Summon Pill (Always available when Idle / floating on screen) */}
      {!isVisible && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 pointer-events-auto select-none animate-in fade-in slide-in-from-bottom-4 duration-500">
          <button
            type="button"
            onClick={handleManualWake}
            className="flex items-center gap-3 px-5 py-3 rounded-full liquid-glass shadow-[0_10px_35px_rgba(0,191,255,0.3)] hover:scale-105 hover:border-cyan-500/50 active:scale-95 transition-all group"
          >
            <div className="w-2.5 h-2.5 rounded-full bg-[#00BFFF] animate-ping" />
            <span className="text-xs font-semibold tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-white via-cyan-100 to-[#00BFFF]">
              SAY &ldquo;HEY ASTRA&rdquo; OR CLICK TO WAKE
            </span>
            <div className="p-1 rounded-full liquid-glass-pill text-cyan-400 group-hover:text-white transition-colors">
              <Mic className="w-3.5 h-3.5" />
            </div>
          </button>
        </div>
      )}

      {/* 2. Floating Spatial Astra Overlay (Pure Transparent Backdrop - ONLY Orb & Typebar) */}
      {isVisible && (
        <div
          className={`fixed inset-0 z-50 flex flex-col items-center justify-center p-6 bg-transparent pointer-events-none transition-all duration-500 ${
            animStage === 'waking'
              ? 'opacity-0 scale-75 animate-in fade-in zoom-in-75 duration-500 fill-mode-forwards'
              : animStage === 'exiting'
              ? 'opacity-0 scale-90'
              : 'opacity-100 scale-100'
          } ${className}`}
        >
          {/* Top Dismiss Button */}
          <button
            type="button"
            onClick={handleDismiss}
            title="Dismiss Astra (Esc)"
            className="pointer-events-auto absolute top-6 right-8 p-2.5 rounded-2xl liquid-glass-card text-white/50 hover:text-white hover:bg-white/10 transition-all select-none"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Center Floating Assistant Container (Pure Orb & Typebar) */}
          <div className="pointer-events-auto flex flex-col items-center justify-center w-full max-w-2xl gap-2 select-none my-auto">
            {/* Centerpiece Living Orb + Harmonic Ring */}
            <div className="relative flex items-center justify-center -mt-6">
              {/* Circular Harmonic Audio Waveform */}
              <VoiceVisualizer
                state={state}
                audioLevel={audioLevel}
                size={440}
              />

              {/* Existing Astra Living AI Energy Orb */}
              <AstraOrb
                size={380}
                color="#00BFFF"
                state={state}
                audioLevel={audioLevel}
                onClick={onToggleVoice}
              />
            </div>

            {/* Typography & Status Feedback */}
            <div className="flex flex-col items-center gap-2 -mt-4 mb-3">
              <AstraLogo size="md" align="center" showSubtitle={true} />

              <div className="flex items-center gap-2.5 px-5 py-1.5 rounded-full liquid-glass-pill shadow-[0_0_25px_rgba(0,191,255,0.3)]">
                <span
                  className={`w-2 h-2 rounded-full ${
                    state === 'WAKING'
                      ? 'bg-cyan-300 animate-ping'
                      : state === 'LISTENING'
                      ? 'bg-cyan-400 animate-pulse'
                      : state === 'THINKING'
                      ? 'bg-purple-400 animate-spin'
                      : state === 'SPEAKING'
                      ? 'bg-[#00BFFF] animate-bounce'
                      : 'bg-[#00BFFF]'
                  }`}
                />
                <span className="text-[11px] font-mono tracking-widest text-cyan-300 font-semibold uppercase">
                  {statusText}
                </span>
              </div>
            </div>

            {/* Speaking Live Transcript Card (if active) */}
            {activeResponseText && (state === 'SPEAKING' || state === 'THINKING') && (
              <div className="w-full max-w-xl p-4 rounded-3xl liquid-glass mb-2 animate-in fade-in slide-in-from-bottom-2 select-text shadow-[0_15px_40px_rgba(0,0,0,0.7)]">
                <div className="flex items-center gap-2 pb-2 border-b border-white/10 text-cyan-300 text-[10px] font-mono">
                  <Volume2 className="w-3.5 h-3.5 text-cyan-400" />
                  <span>NEURAL AUDIO SYNTHESIS</span>
                </div>
                <div className="text-xs text-[#E6F7FF] font-sans mt-2 leading-relaxed max-h-24 overflow-y-auto astra-scrollbar whitespace-pre-wrap">
                  {activeResponseText}
                </div>
              </div>
            )}

            {/* Attached Existing Pure Type Bar */}
            <div className="w-full max-w-2xl flex flex-col items-center mt-2">
              <CommandBar
                onSend={handleCommandSend}
                onToggleVoice={onToggleVoice}
                isRecording={isRecording}
                state={state}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AstraFloatingAssistant;
