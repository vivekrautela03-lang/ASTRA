import React, { useState, useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { 
  Home, MessageSquare, CheckSquare, Calendar as CalendarIcon, 
  FileText, Folder, Briefcase, Wrench, Settings as SettingsIcon,
  Mic, Bell, Moon, Sparkles, ChevronRight,
  X, Menu, UserCheck, Eye
} from 'lucide-react';
import type { EvaState } from '../../types/eva';
import { AstraResponse } from './AstraResponse';
import { AstraSettings } from './AstraSettings';
import { AstraOrb } from './AstraOrb';
import { CameraWidget } from './AstraWidgets/CameraWidget';
import { KnowledgeRAGWidget } from './AstraWidgets/KnowledgeRAGWidget';
import { internetSearchService, type GoogleWeatherData } from '../../services/internetSearchService';

interface AstraDesktopInterfaceProps {
  state: EvaState;
  onSetEvaState: (newState: EvaState) => void;
  onSendPrompt: (prompt: string) => void;
  lastResponseText: string;
  onToggleVoice: () => void;
  onStopSpeaking?: () => void;
  selectedModel: string;
  onSelectModel: (model: string) => void;
}

export const AstraDesktopInterface: React.FC<AstraDesktopInterfaceProps> = ({
  state,
  onSendPrompt,
  lastResponseText,
  onToggleVoice,
  onStopSpeaking,
  selectedModel,
  onSelectModel
}) => {
  const [inputText, setInputText] = useState('');
  const [activeTab, setActiveTab] = useState('Home');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [isRAGOpen, setIsRAGOpen] = useState(false);
  const [isOrbCanvasOpen, setIsOrbCanvasOpen] = useState(false);

  const [weather, setWeather] = useState<GoogleWeatherData | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const [currentTime, setCurrentTime] = useState('10:42 PM');
  const [currentDateStr, setCurrentDateStr] = useState('Friday, 16 May');

  // Dynamic Yellow Glowing Voice Line Path State
  const [wavePoints, setWavePoints] = useState<number[]>(Array(40).fill(0));

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      setCurrentDateStr(now.toLocaleDateString([], { weekday: 'long', day: 'numeric', month: 'short' }));
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const loadWeather = async () => {
      const loc = await internetSearchService.fetchFreeIPLocation();
      const data = await internetSearchService.fetchFreeWeather(loc?.lat, loc?.lon, loc?.city);
      setWeather(data);
    };
    loadWeather();
  }, []);

  // Dynamic Yellow Glowing Voice Waveform Line Render Loop
  useEffect(() => {
    let animFrame: number;
    let tick = 0;

    const updateWave = () => {
      tick += 0.14;
      const points = Array(40).fill(0).map((_, i) => {
        const distFromCenter = Math.abs(i - 20) / 20;
        const centerFactor = Math.pow(1 - distFromCenter, 2);

        if (state === 'speaking') {
          const s1 = Math.sin(tick * 4 + i * 0.4);
          const s2 = Math.cos(tick * 6 + i * 0.2);
          return (s1 + s2) * 26 * centerFactor;
        } else if (state === 'thinking') {
          const s = Math.sin(tick * 7 + i * 0.5);
          return s * 22 * centerFactor;
        } else if (state === 'listening') {
          const s = Math.sin(tick * 3 + i * 0.3);
          return s * 16 * centerFactor;
        } else {
          const s = Math.sin(tick * 1.5 + i * 0.25);
          return s * 7 * centerFactor;
        }
      });

      setWavePoints(points);
      animFrame = requestAnimationFrame(updateWave);
    };

    updateWave();
    return () => cancelAnimationFrame(animFrame);
  }, [state]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    onSendPrompt(inputText.trim());
    setInputText('');
  };

  const generateSvgPath = () => {
    const width = 450;
    const height = 50;
    const midY = height / 2;
    const step = width / (wavePoints.length - 1);

    let d = `M 0 ${midY}`;
    wavePoints.forEach((yOffset, i) => {
      const x = i * step;
      const y = midY - yOffset;
      d += ` L ${x} ${y}`;
    });

    return d;
  };

  const navItems = [
    { name: 'Home', icon: Home },
    { name: 'Chat with Astra', icon: MessageSquare },
    { name: 'Tasks', icon: CheckSquare },
    { name: 'Calendar', icon: CalendarIcon },
    { name: 'Notes', icon: FileText },
    { name: 'Files', icon: Folder },
    { name: 'Projects', icon: Briefcase },
    { name: 'Smart Tools', icon: Wrench },
    { name: 'Settings', icon: SettingsIcon },
  ];

  return (
    <div className="relative w-full h-screen bg-[#05030d] text-white font-sans overflow-hidden select-none">
      
      {/* 1. UNZOOMED HARDWARE ACCELERATED SPACE NEBULA & MANDALA VIDEO BACKGROUND */}
      <video
        ref={videoRef}
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover object-center z-0 filter brightness-[0.68] contrast-[1.18] saturate-[1.15]"
        src="https://res.cloudinary.com/qia3rzqk/video/upload/v1786772058/VID-20260815-WA0003_gowuqn.mp4"
      />

      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(5,3,13,0.1)_0%,rgba(5,3,13,0.5)_65%,rgba(5,3,13,0.88)_100%)] pointer-events-none z-10" />

      {/* 2. MASTER DESKTOP WRAPPER */}
      <div className="relative z-20 w-full h-full p-4 flex flex-col justify-between overflow-hidden">
        
        {/* TOP FLOATING BAR */}
        <div className="w-full flex items-center justify-between gap-4 shrink-0">
          
          {/* Top Left Floating Hamburger Button */}
          <div className="flex items-center">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2.5 rounded-2xl bg-[#0e0a1f]/85 hover:bg-[#1a123a] border border-white/15 backdrop-blur-3xl text-amber-300 transition-all active:scale-95 shadow-lg shadow-amber-500/10"
              title="Toggle Menu"
            >
              {isSidebarOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>

          {/* Top Center Command Input Bar */}
          <div className="flex items-center gap-2 flex-1 max-w-xl">
            <form onSubmit={handleSubmit} className="flex-1 flex items-center gap-2 px-5 py-2 rounded-full bg-[#0e0a1f]/85 border border-white/15 backdrop-blur-3xl shadow-xl">
              <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Ask Astra anything, Boss..."
                className="flex-1 bg-transparent border-none outline-none text-xs text-white placeholder:text-white/40 font-sans tracking-wide"
              />
              <button
                type="button"
                onClick={onToggleVoice}
                className={`p-1.5 rounded-full transition-all ${
                  state === 'listening' || state === 'speaking' ? 'bg-amber-400 text-black animate-pulse' : 'text-white/60 hover:text-white'
                }`}
              >
                <Mic className="w-4 h-4" />
              </button>
            </form>

            <span className="px-3 py-2 rounded-2xl bg-[#0e0a1f]/85 border border-white/15 backdrop-blur-3xl text-[10px] font-mono text-white/60 shadow-lg">
              Ctrl + Space
            </span>
          </div>

          {/* Top Right Status Badge */}
          <div className="flex items-center gap-4 px-5 py-2 rounded-full bg-[#0e0a1f]/85 border border-white/15 backdrop-blur-3xl text-xs font-mono shadow-xl">
            <div className="flex flex-col items-end">
              <span className="font-bold text-white text-xs tracking-wider">{currentTime}</span>
              <span className="text-[9px] text-white/50">{currentDateStr}</span>
            </div>
            <div className="h-6 w-px bg-white/15" />
            <div className="flex items-center gap-2">
              <Moon className="w-4 h-4 text-cyan-300" />
              <div className="flex flex-col">
                <span className="font-bold text-white text-xs">{weather ? `${weather.temperature}°` : '28°'}</span>
                <span className="text-[9px] text-white/50">{weather?.condition || 'Clear Sky'}</span>
              </div>
            </div>
            <div className="h-6 w-px bg-white/15" />
            <button onClick={() => setIsSettingsOpen(true)} className="text-white/60 hover:text-white">
              <Bell className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* MAIN CENTERPIECE: CLEAN SCREEN REVEALING THE FULL ASTROLABE WHEEL & VOICE LINE */}
        <main className="relative z-20 flex-1 flex flex-col items-center justify-center p-4">
          
          {/* Header Title & Glowing Yellow Waveform SVG */}
          <div className="flex flex-col items-center text-center mb-6">
            <h1 className="text-5xl md:text-7xl font-light tracking-[0.38em] text-white font-sans uppercase drop-shadow-[0_4px_30px_rgba(255,255,255,0.7)]">
              ASTRA
            </h1>
            <p className="text-xs md:text-sm font-semibold tracking-[0.42em] text-amber-200 font-mono uppercase mt-2 drop-shadow-md">
              AI PERSONAL ASSISTANT
            </p>

            {/* Dynamic Yellow Glowing Voice Waveform SVG */}
            <div className="w-full max-w-[460px] h-14 flex items-center justify-center mt-3">
              <svg className="w-full h-full overflow-visible" viewBox="0 0 450 50">
                <defs>
                  <linearGradient id="yellowGlowGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.2" />
                    <stop offset="25%" stopColor="#fbbf24" stopOpacity="0.8" />
                    <stop offset="50%" stopColor="#fef08a" stopOpacity="1.0" />
                    <stop offset="75%" stopColor="#fbbf24" stopOpacity="0.8" />
                    <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.2" />
                  </linearGradient>
                  <filter id="neonYellowGlow" x="-30%" y="-30%" width="160%" height="160%">
                    <feGaussianBlur stdDeviation="3.5" result="blur" />
                    <feMerge>
                      <feMergeNode in="blur" />
                      <feMergeNode in="blur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                </defs>

                <path
                  d={generateSvgPath()}
                  fill="none"
                  stroke="#f59e0b"
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  filter="url(#neonYellowGlow)"
                  className="opacity-80"
                />
                <path
                  d={generateSvgPath()}
                  fill="none"
                  stroke="url(#yellowGlowGrad)"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </div>

          {/* Live Response Panel */}
          <div className="w-full max-w-xl">
            <AstraResponse
              state={state}
              responseText={lastResponseText}
              onStopSpeaking={onStopSpeaking}
            />
          </div>

          {/* Camera Overlay Modal */}
          <AnimatePresence>
            {isCameraOpen && (
              <div className="mt-4">
                <CameraWidget isOpen={isCameraOpen} onClose={() => setIsCameraOpen(false)} />
              </div>
            )}
          </AnimatePresence>

          {/* RAG Knowledge Base Overlay */}
          <AnimatePresence>
            {isRAGOpen && (
              <div className="mt-4">
                <KnowledgeRAGWidget />
              </div>
            )}
          </AnimatePresence>

          {/* Interactive 3D Three.js Golden Mechanical Orb Canvas Overlay */}
          <AnimatePresence>
            {isOrbCanvasOpen && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/80 backdrop-blur-2xl p-4"
              >
                <button
                  onClick={() => setIsOrbCanvasOpen(false)}
                  className="absolute top-6 right-6 p-3 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-white"
                >
                  <X className="w-6 h-6" />
                </button>
                <h2 className="text-xl font-bold text-amber-300 tracking-widest font-mono mb-1">
                  ASTRA 3D MECHANICAL CHAKRA ORB
                </h2>
                <p className="text-xs text-white/60 font-mono mb-4">
                  Drag to rotate 360° • Scroll to zoom
                </p>
                <div className="w-[340px] h-[340px] md:w-[480px] md:h-[480px]">
                  <AstraOrb state={state} showStatusPill={true} />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>

        {/* BOTTOM FLOATING DOCK BAR */}
        <div className="w-full flex items-center justify-center py-2 shrink-0">
          <div className="px-6 py-2.5 rounded-full bg-[#0e0a1f]/90 border border-white/15 backdrop-blur-3xl text-xs font-mono flex items-center gap-4 shadow-2xl">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="p-1 text-amber-300 hover:text-amber-200 flex items-center gap-1.5 font-bold"
              title="Open Navigation"
            >
              <Menu className="w-4 h-4" />
              <span>Menu</span>
            </button>
            <div className="h-4 w-px bg-white/15" />
            <button
              onClick={onToggleVoice}
              className="flex items-center gap-2 text-amber-300 font-bold hover:text-amber-200"
            >
              <Sparkles className="w-4 h-4 animate-pulse text-amber-400" />
              <span>Press <span className="text-white font-extrabold">★</span> to talk to Astra</span>
            </button>
            <div className="h-4 w-px bg-white/15" />
            <button
              onClick={() => setIsOrbCanvasOpen(true)}
              className="p-1 text-cyan-300 hover:text-cyan-200 flex items-center gap-1.5"
              title="Focus 3D Orb"
            >
              <Eye className="w-4 h-4" />
              <span>3D Orb</span>
            </button>
            <div className="h-4 w-px bg-white/15" />
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="text-white/60 hover:text-white"
              title="Settings"
            >
              <SettingsIcon className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>

      {/* FLOATING SIDEBAR DRAWER OVERLAY (TRIGGERED BY HAMBURGER ICON) */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0, x: -80 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -80 }}
            className="fixed top-12 left-4 z-50 w-72 p-4 rounded-3xl bg-[#0e0a1f]/95 border border-amber-500/40 backdrop-blur-3xl shadow-[0_20px_50px_rgba(0,0,0,0.85)] flex flex-col gap-3 font-sans"
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span className="font-bold text-white text-xs tracking-wider">ASTRA CONTROL PANEL</span>
              </div>
              <button onClick={() => setIsSidebarOpen(false)} className="p-1 text-white/60 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex flex-col gap-1 text-xs">
              {navItems.map(item => {
                const Icon = item.icon;
                const isActive = activeTab === item.name;
                return (
                  <button
                    key={item.name}
                    onClick={() => {
                      setActiveTab(item.name);
                      if (item.name === 'Smart Tools') setIsRAGOpen(true);
                      if (item.name === 'Settings') setIsSettingsOpen(true);
                      setIsSidebarOpen(false);
                    }}
                    className={`w-full px-3.5 py-2.5 rounded-2xl flex items-center justify-between transition-all ${
                      isActive 
                        ? 'bg-gradient-to-r from-amber-500/30 to-yellow-500/10 border border-amber-500/50 text-amber-300 font-bold' 
                        : 'text-white/70 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={`w-4 h-4 ${isActive ? 'text-amber-400' : 'text-white/60'}`} />
                      <span>{item.name}</span>
                    </div>
                    {isActive && <ChevronRight className="w-3.5 h-3.5 text-amber-400" />}
                  </button>
                );
              })}
            </div>

            {/* Profile Drawer Footer */}
            <div className="mt-2 pt-3 border-t border-white/10 flex items-center justify-between px-1">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-400 to-yellow-500 p-0.5">
                  <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center text-xs font-bold text-amber-300">
                    VR
                  </div>
                </div>
                <div>
                  <h4 className="font-bold text-white text-[11px]">Vivek Rautela</h4>
                  <p className="text-[9px] text-amber-200/80 font-mono">Premium User</p>
                </div>
              </div>
              <UserCheck className="w-4 h-4 text-emerald-400" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Settings Modal */}
      <AstraSettings
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        selectedModel={selectedModel}
        onSelectModel={onSelectModel}
      />
    </div>
  );
};
