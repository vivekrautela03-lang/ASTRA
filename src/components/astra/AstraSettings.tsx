import React from 'react';
import { Volume2, Mic, Camera, Shield, Cpu, X, Play } from 'lucide-react';
import { useTextToSpeech } from '../../hooks/useTextToSpeech';

interface AstraSettingsProps {
  isOpen: boolean;
  onClose: () => void;
  selectedModel: string;
  onSelectModel: (model: string) => void;
}

export const AstraSettings: React.FC<AstraSettingsProps> = ({
  isOpen,
  onClose,
  selectedModel,
  onSelectModel
}) => {
  const { voiceSettings, availableVoices, updateSettings, testVoice } = useTextToSpeech();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
      <div className="w-full max-w-2xl p-6 rounded-3xl bg-slate-950/90 border border-amber-500/40 backdrop-blur-3xl shadow-2xl flex flex-col gap-6 font-sans text-slate-100">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-2">
            <Cpu className="w-5 h-5 text-amber-400" />
            <h2 className="font-mono font-bold text-lg text-white tracking-wide uppercase">ASTRA System Settings</h2>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-white/10 text-white/50 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Tabs Grid */}
        <div className="grid grid-cols-2 gap-6 text-xs">
          
          {/* VOICE CONTROLS */}
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex flex-col gap-4">
            <h3 className="font-mono font-bold text-amber-300 uppercase flex items-center gap-2">
              <Volume2 className="w-4 h-4 text-amber-400" /> Voice Controls
            </h3>

            <div className="flex items-center justify-between">
              <span>Enable Voice Output</span>
              <button
                onClick={() => updateSettings({ enabled: !voiceSettings.enabled })}
                className={`px-3 py-1 rounded-full text-[11px] font-mono font-bold transition-all ${
                  voiceSettings.enabled ? 'bg-amber-400 text-black' : 'bg-white/10 text-white/50'
                }`}
              >
                {voiceSettings.enabled ? 'ENABLED' : 'MUTED'}
              </button>
            </div>

            {/* Volume Slider */}
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-white/60">Volume</span>
                <span className="font-mono text-amber-300">{Math.round(voiceSettings.volume * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={voiceSettings.volume}
                onChange={(e) => updateSettings({ volume: parseFloat(e.target.value) })}
                className="w-full accent-amber-400 cursor-pointer"
              />
            </div>

            {/* Speed Slider */}
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-white/60">Speech Speed</span>
                <span className="font-mono text-amber-300">{voiceSettings.rate}x</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="2"
                step="0.1"
                value={voiceSettings.rate}
                onChange={(e) => updateSettings({ rate: parseFloat(e.target.value) })}
                className="w-full accent-amber-400 cursor-pointer"
              />
            </div>

            {/* Voice Selection */}
            <div>
              <label className="text-white/60 mb-1 block">Voice Model</label>
              <select
                value={voiceSettings.selectedVoiceURI}
                onChange={(e) => updateSettings({ selectedVoiceURI: e.target.value })}
                className="w-full p-2 rounded-xl bg-black/60 border border-white/15 text-white outline-none text-[11px]"
              >
                {availableVoices.map(v => (
                  <option key={v.voiceURI} value={v.voiceURI} className="bg-slate-900 text-white">
                    {v.name} ({v.lang})
                  </option>
                ))}
              </select>
            </div>

            {/* Test Voice */}
            <button
              onClick={() => testVoice("Hello Boss, I am ASTRA. Voice configuration is operational.")}
              className="py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 font-bold flex items-center justify-center gap-1.5 transition-all"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Test ASTRA Voice</span>
            </button>
          </div>

          {/* PRIVACY & AI MODELS */}
          <div className="flex flex-col gap-4">
            
            {/* PRIVACY PERMISSIONS */}
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex flex-col gap-3">
              <h3 className="font-mono font-bold text-cyan-300 uppercase flex items-center gap-2">
                <Shield className="w-4 h-4 text-cyan-400" /> Permissions & Privacy
              </h3>

              <div className="flex justify-between items-center p-2 rounded-xl bg-black/40">
                <span className="flex items-center gap-1.5"><Mic className="w-3.5 h-3.5 text-amber-400" /> Microphone</span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono text-[10px]">Granted</span>
              </div>

              <div className="flex justify-between items-center p-2 rounded-xl bg-black/40">
                <span className="flex items-center gap-1.5"><Camera className="w-3.5 h-3.5 text-cyan-400" /> Camera API</span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono text-[10px]">Secure Mode</span>
              </div>
            </div>

            {/* AI MODEL SELECTOR */}
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex flex-col gap-3">
              <h3 className="font-mono font-bold text-purple-300 uppercase flex items-center gap-2">
                <Cpu className="w-4 h-4 text-purple-400" /> AI LLM Routing Engine
              </h3>

              <select
                value={selectedModel}
                onChange={(e) => onSelectModel(e.target.value)}
                className="w-full p-2 rounded-xl bg-black/60 border border-white/15 text-white outline-none text-[11px]"
              >
                <option value="deepseek-r1" className="bg-slate-900">DeepSeek R1 Quantum (Reasoning)</option>
                <option value="llama-3-70b" className="bg-slate-900">Groq Llama 3 70B (Sub-40ms Fast)</option>
                <option value="gemini-1-5-pro" className="bg-slate-900">Google Gemini 1.5 Pro (Multimodal)</option>
                <option value="claude-3-5-sonnet" className="bg-slate-900">Claude 3.5 Sonnet (Code & UI)</option>
              </select>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
