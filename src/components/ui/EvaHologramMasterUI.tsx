import React, { useState } from 'react';
import { Sun, Moon, Sparkles } from 'lucide-react';
import type { EvaState } from '../../types/eva';
import { EvaCanvasContainer } from '../canvas/EvaCanvasContainer';
import { EvaVoiceWaveformBar } from './EvaVoiceWaveformBar';

interface EvaHologramMasterUIProps {
  state: EvaState;
  onStateChange: (newState: EvaState) => void;
  onSendPrompt: (prompt: string) => void;
  lastResponseText: string;
  onToggleVoice: () => void;
  onOpenDashboard: () => void;
  onOpenJarvisScreens: () => void;
  onOpenCameraVision: () => void;
  onOpenChatHistory: () => void;
}

export const EvaHologramMasterUI: React.FC<EvaHologramMasterUIProps> = ({
  state,
  onStateChange,
  onSendPrompt,
  lastResponseText,
  onToggleVoice,
  onOpenDashboard,
  onOpenJarvisScreens,
  onOpenCameraVision,
  onOpenChatHistory
}) => {
  const [isLightTheme, setIsLightTheme] = useState(true); // Apple Light Spatial Theme default

  return (
    <div className={`relative w-full h-screen font-sans overflow-hidden select-none p-4 md:p-6 flex flex-col justify-between items-center transition-colors duration-700 ${
      isLightTheme ? 'bg-slate-50 text-slate-900' : 'bg-slate-950 text-white'
    }`}>
      
      {/* Apple Siri Spatial Liquid Aura Background */}
      {isLightTheme ? (
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_45%,rgba(147,197,253,0.45)_0%,rgba(192,132,252,0.25)_35%,rgba(244,114,182,0.12)_60%,#f8fafc_80%)] pointer-events-none transition-all duration-700" />
      ) : (
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_45%,rgba(30,58,138,0.45)_0%,rgba(88,28,135,0.30)_40%,rgba(15,23,42,0.98)_75%)] pointer-events-none transition-all duration-700" />
      )}

      {/* APPLE iOS SIRI TOP HEADER */}
      <header className={`relative z-30 w-full max-w-7xl flex items-center justify-between pointer-events-auto border-b pb-3 transition-colors ${
        isLightTheme ? 'border-slate-200/80' : 'border-slate-800/80'
      }`}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 via-indigo-500 to-pink-500 p-0.5 shadow-lg flex items-center justify-center">
            <div className="w-full h-full rounded-full bg-white dark:bg-slate-950 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-blue-500 animate-pulse" />
            </div>
          </div>

          <h1 className={`text-lg md:text-xl font-semibold font-sans tracking-tight ${
            isLightTheme ? 'text-slate-900' : 'text-slate-100'
          }`}>
            ASTRA <span className="text-slate-400 font-normal text-sm">:: Apple Intelligence Spatial UI</span>
          </h1>
        </div>

        <div className="flex items-center gap-3 text-xs font-medium">
          {/* Theme Toggle Button */}
          <button
            onClick={() => setIsLightTheme(!isLightTheme)}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full border backdrop-blur-2xl transition-all active:scale-95 shadow-sm ${
              isLightTheme 
                ? 'bg-white/80 border-slate-200 text-slate-800 hover:bg-white' 
                : 'bg-slate-900/80 border-slate-700 text-slate-200 hover:bg-slate-900'
            }`}
          >
            {isLightTheme ? <Moon className="w-3.5 h-3.5 text-blue-600" /> : <Sun className="w-3.5 h-3.5 text-amber-400" />}
            <span>{isLightTheme ? 'iOS Light Spatial' : 'iOS Dark Spatial'}</span>
          </button>
        </div>
      </header>

      {/* CENTRAL APPLE SIRI SPATIAL ORB CORE */}
      <main className="relative z-20 w-full flex-1 flex items-center justify-center pointer-events-auto">
        <div className="relative w-full max-w-4xl h-[540px] flex items-center justify-center">
          <EvaCanvasContainer
            state={state}
            audioLevel={state === 'speaking' ? 0.8 : 0.2}
            entranceProgress={1.0}
          />
        </div>
      </main>

      {/* BOTTOM SIRI GLASSMORPHISM WAVEFORM BAR */}
      <footer className="relative z-30 w-full max-w-4xl pb-4 pointer-events-auto">
        <EvaVoiceWaveformBar
          state={state}
          onSetEvaState={onStateChange}
          onSendPrompt={onSendPrompt}
          lastResponseText={lastResponseText}
          onToggleVoice={onToggleVoice}
          onOpenDashboard={onOpenDashboard}
          onOpenJarvisScreens={onOpenJarvisScreens}
          onOpenCameraVision={onOpenCameraVision}
          onOpenChatHistory={onOpenChatHistory}
        />
      </footer>
    </div>
  );
};
