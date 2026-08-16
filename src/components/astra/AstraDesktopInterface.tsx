import React, { useState, useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { 
  Home, MessageSquare, CheckSquare, Calendar as CalendarIcon, 
  FileText, Folder, Briefcase, Wrench, Settings as SettingsIcon,
  Mic, Bell, Moon, Sun, Sparkles, ChevronRight,
  ChevronDown, FileCode, Layers, Scissors, Globe, ImageIcon,
  X, Activity, Cpu, HardDrive, Wifi
} from 'lucide-react';
import type { EvaState } from '../../types/eva';
import { AstraResponse } from './AstraResponse';
import { AstraSettings } from './AstraSettings';
import { AstraOrb } from './AstraOrb';
import { CameraWidget } from './AstraWidgets/CameraWidget';
import { KnowledgeRAGWidget } from './AstraWidgets/KnowledgeRAGWidget';
import { vectorStoreService } from '../../services/rag/vectorStore';
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
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [isRAGOpen, setIsRAGOpen] = useState(false);
  const [isOrbCanvasOpen, setIsOrbCanvasOpen] = useState(false);

  const [weather, setWeather] = useState<GoogleWeatherData | null>(null);
  const [ragDocsCount, setRagDocsCount] = useState(vectorStoreService.getAllDocuments().length);

  const videoRef = useRef<HTMLVideoElement>(null);
  const [currentTime, setCurrentTime] = useState('10:42 PM');
  const [currentDateStr, setCurrentDateStr] = useState('Friday, 16 May');
  const [greetingTitle, setGreetingTitle] = useState('Good Evening, Vivek! 👋');

  // Dynamic Yellow Glowing Voice Line Path State
  const [wavePoints, setWavePoints] = useState<number[]>(Array(40).fill(0));

  useEffect(() => {
    const updateTimeAndGreeting = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      setCurrentDateStr(now.toLocaleDateString([], { weekday: 'long', day: 'numeric', month: 'short' }));

      const hour = now.getHours();
      if (hour >= 5 && hour < 12) setGreetingTitle('Good Morning, Vivek! 👋');
      else if (hour >= 12 && hour < 17) setGreetingTitle('Good Afternoon, Vivek! 👋');
      else if (hour >= 17 && hour < 22) setGreetingTitle('Good Evening, Vivek! 👋');
      else setGreetingTitle('Good Night, Vivek! 👋');
    };

    updateTimeAndGreeting();
    const interval = setInterval(updateTimeAndGreeting, 1000);
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

  useEffect(() => {
    setRagDocsCount(vectorStoreService.getAllDocuments().length);
  }, [lastResponseText]);

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
        className="absolute inset-0 w-full h-full object-cover object-center z-0 filter brightness-[0.62] contrast-[1.18] saturate-[1.15]"
        src="https://res.cloudinary.com/qia3rzqk/video/upload/v1786772058/VID-20260815-WA0003_gowuqn.mp4"
      />

      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(5,3,13,0.15)_0%,rgba(5,3,13,0.6)_65%,rgba(5,3,13,0.92)_100%)] pointer-events-none z-10" />

      {/* 2. MASTER DESKTOP WRAPPER (FIT 100% IN 100VH NO SCROLL) */}
      <div className="relative z-20 w-full h-full p-2.5 flex flex-col justify-between gap-2 overflow-hidden">
        
        {/* TOP FLOATING BAR */}
        <div className="w-full flex items-center justify-between gap-3 shrink-0">
          
          {/* Top Left Logo */}
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-amber-500 via-yellow-400 to-amber-600 p-0.5 shadow-md shadow-amber-500/20">
              <div className="w-full h-full rounded-[5px] bg-[#0d0926] flex items-center justify-center">
                <Sparkles className="w-3 h-3 text-amber-300 animate-pulse" />
              </div>
            </div>
            <div>
              <h1 className="text-[11px] font-bold tracking-[0.3em] text-white uppercase">ASTRA</h1>
              <p className="text-[7.5px] font-mono tracking-widest text-amber-200/80 uppercase">AI PERSONAL ASSISTANT</p>
            </div>
          </div>

          {/* Top Center Command Input Bar */}
          <div className="flex items-center gap-2 flex-1 max-w-lg">
            <form onSubmit={handleSubmit} className="flex-1 flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#0e0a1f]/85 border border-white/15 backdrop-blur-3xl shadow-lg">
              <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Ask Astra anything..."
                className="flex-1 bg-transparent border-none outline-none text-[11px] text-white placeholder:text-white/40 font-sans tracking-wide"
              />
              <button
                type="button"
                onClick={onToggleVoice}
                className={`p-1 rounded-full transition-all ${
                  state === 'listening' || state === 'speaking' ? 'bg-amber-400 text-black animate-pulse' : 'text-white/60 hover:text-white'
                }`}
              >
                <Mic className="w-3.5 h-3.5" />
              </button>
            </form>

            <span className="px-2.5 py-1.5 rounded-2xl bg-[#0e0a1f]/85 border border-white/15 backdrop-blur-3xl text-[9px] font-mono text-white/60 shadow-md">
              Ctrl + Space
            </span>
          </div>

          {/* Top Right Status Badge */}
          <div className="flex items-center gap-3 px-4 py-1.5 rounded-full bg-[#0e0a1f]/85 border border-white/15 backdrop-blur-3xl text-[11px] font-mono shadow-md">
            <div className="flex flex-col items-end">
              <span className="font-bold text-white text-[11px] tracking-wider">{currentTime}</span>
              <span className="text-[8px] text-white/50">{currentDateStr}</span>
            </div>
            <div className="h-5 w-px bg-white/15" />
            <div className="flex items-center gap-1.5">
              <Moon className="w-3.5 h-3.5 text-cyan-300" />
              <div className="flex flex-col">
                <span className="font-bold text-white text-[11px]">{weather ? `${weather.temperature}°` : '28°'}</span>
                <span className="text-[8px] text-white/50">{weather?.condition || 'Clear Sky'}</span>
              </div>
            </div>
            <div className="h-5 w-px bg-white/15" />
            <button onClick={() => setIsSettingsOpen(true)} className="text-white/60 hover:text-white">
              <Bell className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* MAIN DESKTOP GRID LAYOUT (RESPONSIVE FLEX OVERFLOW FIT) */}
        <div className="w-full flex-1 grid grid-cols-12 gap-2.5 items-stretch overflow-hidden">
          
          {/* LEFT COLUMN: FLOATING SIDEBAR & LEFT CARDS (3 COLS) */}
          <div className="col-span-3 flex flex-col gap-2 justify-between overflow-hidden">
            
            {/* Sidebar Navigation Glass Card */}
            <div className="p-2 rounded-2xl bg-[#0e0a1f]/80 border border-white/15 backdrop-blur-3xl shadow-xl flex flex-col gap-0.5 text-[11px]">
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
                    }}
                    className={`w-full px-2.5 py-1.5 rounded-xl flex items-center justify-between transition-all ${
                      isActive 
                        ? 'bg-gradient-to-r from-amber-500/25 to-yellow-500/10 border border-amber-500/40 text-amber-300 font-bold shadow-[0_0_12px_rgba(245,158,11,0.2)]' 
                        : 'text-white/70 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-amber-400' : 'text-white/60'}`} />
                      <span className="text-[11px]">{item.name}</span>
                    </div>
                    {isActive && <ChevronRight className="w-3 h-3 text-amber-400" />}
                  </button>
                );
              })}

              {/* User Profile Badge */}
              <div className="mt-1 pt-1.5 border-t border-white/10 flex items-center justify-between px-1.5">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-amber-400 to-yellow-500 p-0.5">
                    <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center text-[9px] font-bold text-amber-300">
                      VR
                    </div>
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-[10px] tracking-wide">Vivek Rautela</h4>
                    <p className="text-[8px] text-amber-200/80 font-mono">Premium User</p>
                  </div>
                </div>
                <ChevronDown className="w-3 h-3 text-white/50" />
              </div>
            </div>

            {/* Welcome & System Status Card */}
            <div className="p-3 rounded-2xl bg-[#0e0a1f]/80 border border-white/15 backdrop-blur-3xl shadow-xl flex flex-col gap-2 text-[11px]">
              <div>
                <h3 className="font-bold text-white text-xs">{greetingTitle}</h3>
                <p className="text-[9px] text-amber-200/80 font-mono">Astra is here to help you.</p>
              </div>

              <div className="p-2 rounded-xl bg-black/40 border border-white/10 flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full border-2 border-cyan-400/80 border-t-amber-400 flex items-center justify-center font-mono font-bold text-[10px] text-white">
                  98%
                </div>
                <div>
                  <span className="font-bold text-white text-[11px]">System Status</span>
                  <p className="text-[9px] text-emerald-400 font-mono">Optimal •</p>
                </div>
              </div>

              <div className="flex flex-col gap-1 font-mono text-[9px]">
                <div className="flex justify-between items-center">
                  <span className="text-white/60 flex items-center gap-1"><Cpu className="w-2.5 h-2.5 text-cyan-400" /> CPU</span>
                  <div className="w-20 h-1 rounded-full bg-white/10 overflow-hidden"><div className="w-[34%] h-full bg-cyan-400" /></div>
                  <span className="text-white">34%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-white/60 flex items-center gap-1"><Activity className="w-2.5 h-2.5 text-purple-400" /> RAM</span>
                  <div className="w-20 h-1 rounded-full bg-white/10 overflow-hidden"><div className="w-[62%] h-full bg-purple-400" /></div>
                  <span className="text-white">62%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-white/60 flex items-center gap-1"><HardDrive className="w-2.5 h-2.5 text-amber-400" /> Storage</span>
                  <div className="w-20 h-1 rounded-full bg-white/10 overflow-hidden"><div className="w-[71%] h-full bg-amber-400" /></div>
                  <span className="text-white">71%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-white/60 flex items-center gap-1"><Wifi className="w-2.5 h-2.5 text-emerald-400" /> Network</span>
                  <div className="w-20 h-1 rounded-full bg-white/10 overflow-hidden"><div className="w-[89%] h-full bg-emerald-400" /></div>
                  <span className="text-white">89%</span>
                </div>
              </div>
            </div>

            {/* Today's Overview Card */}
            <div className="p-2.5 rounded-2xl bg-[#0e0a1f]/80 border border-white/15 backdrop-blur-3xl shadow-xl flex flex-col gap-1.5 text-[11px]">
              <div className="flex justify-between items-center border-b border-white/10 pb-1">
                <span className="font-bold text-white">Today's Overview</span>
                <span className="text-[9px] text-amber-300 font-mono cursor-pointer">View all</span>
              </div>
              <div className="flex flex-col gap-1 text-[10px] font-mono text-white/80">
                <div className="flex items-center gap-1.5"><span className="w-3.5 h-3.5 rounded bg-amber-500/20 text-amber-300 flex items-center justify-center text-[9px] font-bold">5</span> Tasks Pending</div>
                <div className="flex items-center gap-1.5"><span className="w-3.5 h-3.5 rounded bg-cyan-500/20 text-cyan-300 flex items-center justify-center text-[9px] font-bold">2</span> Meetings</div>
                <div className="flex items-center gap-1.5"><span className="w-3.5 h-3.5 rounded bg-purple-500/20 text-purple-300 flex items-center justify-center text-[9px] font-bold">3</span> Reminders</div>
              </div>
            </div>

            {/* Live Weather Card */}
            <div className="p-2.5 rounded-2xl bg-[#0e0a1f]/80 border border-white/15 backdrop-blur-3xl shadow-xl flex flex-col gap-1 text-[11px]">
              <div className="flex justify-between items-center">
                <div>
                  <span className="text-[8px] text-white/50 font-mono uppercase">Live Weather</span>
                  <h4 className="font-bold text-white text-[11px]">{weather?.city || 'Dehradun, India'}</h4>
                </div>
                <Sun className="w-4 h-4 text-amber-400 animate-spin" />
              </div>
              <div className="flex items-baseline justify-between mt-0.5">
                <span className="text-xl font-extrabold text-white">{weather ? `${weather.temperature}°` : '28°'}</span>
                <span className="text-[10px] text-amber-200 font-semibold">{weather?.condition || 'Clear Sky'}</span>
              </div>
            </div>

          </div>

          {/* CENTER COLUMN: ASTRA HEADER, GLOWING WAVEFORM & RESPONSE PANEL (6 COLS) */}
          <div className="col-span-6 flex flex-col items-center justify-between py-2 overflow-hidden">
            
            {/* ASTRA Center Header */}
            <div className="flex flex-col items-center text-center">
              <h1 className="text-4xl md:text-5xl font-light tracking-[0.38em] text-white font-sans uppercase drop-shadow-[0_4px_25px_rgba(255,255,255,0.6)]">
                ASTRA
              </h1>
              <p className="text-[10px] font-semibold tracking-[0.42em] text-amber-200 font-mono uppercase mt-1 drop-shadow-md">
                AI PERSONAL ASSISTANT
              </p>

              {/* Dynamic Yellow Glowing Voice Waveform SVG */}
              <div className="w-full max-w-[380px] h-10 flex items-center justify-center mt-1">
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
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    filter="url(#neonYellowGlow)"
                    className="opacity-80"
                  />
                  <path
                    d={generateSvgPath()}
                    fill="none"
                    stroke="url(#yellowGlowGrad)"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            </div>

            {/* Live Response Panel */}
            <div className="w-full max-w-lg my-auto">
              <AstraResponse
                state={state}
                responseText={lastResponseText}
                onStopSpeaking={onStopSpeaking}
              />
            </div>

            {/* Camera Overlay Modal */}
            <AnimatePresence>
              {isCameraOpen && (
                <div className="mb-2">
                  <CameraWidget isOpen={isCameraOpen} onClose={() => setIsCameraOpen(false)} />
                </div>
              )}
            </AnimatePresence>

            {/* RAG Knowledge Base Overlay */}
            <AnimatePresence>
              {isRAGOpen && (
                <div className="mb-2">
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
                  <h2 className="text-lg font-bold text-amber-300 tracking-widest font-mono mb-1">
                    ASTRA 3D MECHANICAL CHAKRA ORB
                  </h2>
                  <p className="text-[10px] text-white/60 font-mono mb-3">
                    Drag to rotate 360° • Scroll to zoom
                  </p>
                  <div className="w-[320px] h-[320px] md:w-[450px] md:h-[450px]">
                    <AstraOrb state={state} showStatusPill={true} />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

          </div>

          {/* RIGHT COLUMN: UPCOMING SCHEDULE, ACTIVE PROJECTS & QUICK ACTIONS (3 COLS) */}
          <div className="col-span-3 flex flex-col gap-2 justify-between overflow-hidden">
            
            {/* Upcoming Schedule Card */}
            <div className="p-3 rounded-2xl bg-[#0e0a1f]/80 border border-white/15 backdrop-blur-3xl shadow-xl flex flex-col gap-2 text-[11px]">
              <div className="flex justify-between items-center border-b border-white/10 pb-1">
                <span className="font-bold text-white">Upcoming Schedule</span>
                <span className="text-[9px] text-cyan-400 font-mono cursor-pointer">View Calendar</span>
              </div>

              <div className="flex flex-col gap-1.5 font-mono text-[10px]">
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                  <span className="text-white/60 font-bold">09:30 PM</span>
                  <span className="text-white font-semibold truncate">Project Discussion</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                  <span className="text-white/60 font-bold">11:00 PM</span>
                  <span className="text-white font-semibold truncate">UI/UX Review</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                  <span className="text-white/60 font-bold">01:30 AM</span>
                  <span className="text-white font-semibold truncate">Focus Time</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  <span className="text-white/60 font-bold">04:00 AM</span>
                  <span className="text-white font-semibold truncate">Gym Workout</span>
                </div>
              </div>
            </div>

            {/* Active Projects Card */}
            <div className="p-3 rounded-2xl bg-[#0e0a1f]/80 border border-white/15 backdrop-blur-3xl shadow-xl flex flex-col gap-2 text-[11px]">
              <div className="flex justify-between items-center border-b border-white/10 pb-1">
                <span className="font-bold text-white">Active Projects</span>
                <span className="text-[9px] text-cyan-400 font-mono cursor-pointer">View all</span>
              </div>

              <div className="flex flex-col gap-2 text-[10px]">
                <div>
                  <div className="flex justify-between mb-0.5 font-mono">
                    <span className="text-white font-semibold">Oldverse Production</span>
                    <span className="text-cyan-400">78%</span>
                  </div>
                  <div className="w-full h-1 rounded-full bg-white/10 overflow-hidden"><div className="w-[78%] h-full bg-cyan-400" /></div>
                </div>
                <div>
                  <div className="flex justify-between mb-0.5 font-mono">
                    <span className="text-white font-semibold">ASTRA OS</span>
                    <span className="text-amber-400">62%</span>
                  </div>
                  <div className="w-full h-1 rounded-full bg-white/10 overflow-hidden"><div className="w-[62%] h-full bg-amber-400" /></div>
                </div>
                <div>
                  <div className="flex justify-between mb-0.5 font-mono">
                    <span className="text-white font-semibold">Website Redesign</span>
                    <span className="text-purple-400">40%</span>
                  </div>
                  <div className="w-full h-1 rounded-full bg-white/10 overflow-hidden"><div className="w-[40%] h-full bg-purple-400" /></div>
                </div>
              </div>
            </div>

            {/* Quick Actions Card */}
            <div className="p-3 rounded-2xl bg-[#0e0a1f]/80 border border-white/15 backdrop-blur-3xl shadow-xl flex flex-col gap-2 text-[11px]">
              <span className="font-bold text-white border-b border-white/10 pb-1">Quick Actions</span>
              <div className="grid grid-cols-3 gap-1.5 text-center text-[9px] font-mono">
                <button onClick={() => onSendPrompt('Summarize recent documents')} className="p-1.5 rounded-lg bg-black/40 border border-white/10 hover:border-amber-400 text-amber-200 flex flex-col items-center gap-0.5">
                  <FileText className="w-3 h-3" />
                  <span>Summarize</span>
                </button>
                <button onClick={() => onSendPrompt('Create new task')} className="p-1.5 rounded-lg bg-black/40 border border-white/10 hover:border-cyan-400 text-cyan-200 flex flex-col items-center gap-0.5">
                  <CheckSquare className="w-3 h-3" />
                  <span>Task</span>
                </button>
                <button onClick={() => setIsRAGOpen(!isRAGOpen)} className="p-1.5 rounded-lg bg-black/40 border border-white/10 hover:border-purple-400 text-purple-200 flex flex-col items-center gap-0.5">
                  <Layers className="w-3 h-3" />
                  <span>RAG ({ragDocsCount})</span>
                </button>
                <button onClick={() => setIsCameraOpen(!isCameraOpen)} className="p-1.5 rounded-lg bg-black/40 border border-white/10 hover:border-emerald-400 text-emerald-200 flex flex-col items-center gap-0.5">
                  <Scissors className="w-3 h-3" />
                  <span>Camera</span>
                </button>
                <button onClick={() => onSendPrompt('Translate current text')} className="p-1.5 rounded-lg bg-black/40 border border-white/10 hover:border-pink-400 text-pink-200 flex flex-col items-center gap-0.5">
                  <Globe className="w-3 h-3" />
                  <span>Translate</span>
                </button>
                <button onClick={() => setIsSettingsOpen(true)} className="p-1.5 rounded-lg bg-black/40 border border-white/10 hover:border-white text-white flex flex-col items-center gap-0.5">
                  <SettingsIcon className="w-3 h-3" />
                  <span>Settings</span>
                </button>
              </div>
            </div>

          </div>

        </div>

        {/* BOTTOM CARDS ROW: RECENT CONVERSATIONS, SUGGESTIONS, MEMORY LANE, VOICE & ORB PREVIEW (5 CARDS FIT IN 100VH) */}
        <div className="w-full grid grid-cols-5 gap-2.5 items-stretch shrink-0">
          
          {/* Card 1: Recent Conversations */}
          <div className="p-2.5 rounded-2xl bg-[#0e0a1f]/80 border border-white/15 backdrop-blur-3xl shadow-xl flex flex-col justify-between text-[11px]">
            <div className="flex justify-between items-center border-b border-white/10 pb-1">
              <span className="font-bold text-white text-[10px]">Recent Conversations</span>
              <span className="text-[8px] text-cyan-400 font-mono cursor-pointer">View all</span>
            </div>
            <div className="flex flex-col gap-1 text-[9px] text-white/70 font-sans mt-1">
              <div onClick={() => onSendPrompt('Create a production schedule')} className="flex justify-between cursor-pointer hover:text-white"><span className="truncate max-w-[110px]">• Production schedule</span><span className="text-[7.5px] text-white/40 font-mono">10:21 PM</span></div>
              <div onClick={() => onSendPrompt('Summarize this PDF for me')} className="flex justify-between cursor-pointer hover:text-white"><span className="truncate max-w-[110px]">• Summarize PDF</span><span className="text-[7.5px] text-white/40 font-mono">09:15 PM</span></div>
              <div onClick={() => onSendPrompt('Best places to visit in Uttarakhand')} className="flex justify-between cursor-pointer hover:text-white"><span className="truncate max-w-[110px]">• Uttarakhand trip</span><span className="text-[7.5px] text-white/40 font-mono">06:42 PM</span></div>
            </div>
          </div>

          {/* Card 2: Astra Suggestions */}
          <div className="p-2.5 rounded-2xl bg-[#0e0a1f]/80 border border-white/15 backdrop-blur-3xl shadow-xl flex flex-col justify-between text-[11px]">
            <div className="flex justify-between items-center border-b border-white/10 pb-1">
              <span className="font-bold text-amber-300 text-[10px]">Astra Suggestions</span>
              <span className="text-[8px] text-white/40 font-mono">For you</span>
            </div>
            <div className="flex flex-col gap-1 text-[9px] text-white/80 font-mono mt-1">
              <p className="text-amber-300 truncate">• Meeting in 48 mins (Project Discussion)</p>
              <p className="text-cyan-300 truncate">• Your system is running smoothly</p>
              <p className="text-purple-300 truncate">• Take a break, working for 2h 15m</p>
            </div>
          </div>

          {/* Card 3: Memory Lane */}
          <div className="p-2.5 rounded-2xl bg-[#0e0a1f]/80 border border-white/15 backdrop-blur-3xl shadow-xl flex flex-col justify-between text-[11px]">
            <div className="flex justify-between items-center border-b border-white/10 pb-1">
              <span className="font-bold text-purple-300 text-[10px]">Memory Lane</span>
              <span className="text-[8px] text-white/40 font-mono">Worked on</span>
            </div>
            <div className="flex items-center gap-1.5 text-[9px] font-mono mt-1">
              <div onClick={() => setIsRAGOpen(true)} className="p-1.5 rounded-lg bg-black/40 border border-white/10 flex flex-col items-center text-amber-300 flex-1 cursor-pointer hover:border-amber-400">
                <Folder className="w-3.5 h-3.5 mb-0.5" />
                <span className="truncate max-w-[45px]">Oldverse</span>
              </div>
              <div onClick={() => setIsRAGOpen(true)} className="p-1.5 rounded-lg bg-black/40 border border-white/10 flex flex-col items-center text-rose-400 flex-1 cursor-pointer hover:border-rose-400">
                <FileCode className="w-3.5 h-3.5 mb-0.5" />
                <span className="truncate max-w-[45px]">Brief.pdf</span>
              </div>
              <div onClick={() => setIsRAGOpen(true)} className="p-1.5 rounded-lg bg-black/40 border border-white/10 flex flex-col items-center text-cyan-300 flex-1 cursor-pointer hover:border-cyan-400">
                <ImageIcon className="w-3.5 h-3.5 mb-0.5" />
                <span className="truncate max-w-[45px]">Moodboard</span>
              </div>
            </div>
          </div>

          {/* Card 4: Astra Voice */}
          <div className="p-2.5 rounded-2xl bg-[#0e0a1f]/80 border border-amber-500/30 backdrop-blur-3xl shadow-xl flex flex-col justify-between text-[11px]">
            <div className="flex justify-between items-center border-b border-white/10 pb-1">
              <span className="font-bold text-amber-300 text-[10px]">Astra Voice</span>
              <span className="text-[8px] text-white/40 font-mono">Click to talk</span>
            </div>
            <button
              onClick={onToggleVoice}
              className={`w-full py-2 px-2 rounded-xl flex flex-col items-center justify-center gap-0.5 font-bold transition-all active:scale-95 mt-1 ${
                state === 'speaking' || state === 'listening'
                  ? 'bg-amber-400 text-black animate-pulse shadow-[0_0_15px_rgba(245,158,11,0.8)]'
                  : 'bg-white/10 border border-white/15 text-amber-300 hover:bg-white/20'
              }`}
            >
              <Mic className="w-3.5 h-3.5" />
              <span className="text-[9px] font-mono">{state === 'listening' ? 'Listening...' : "I'm listening..."}</span>
            </button>
          </div>

          {/* Card 5: Astra Orb (Click to focus) */}
          <div 
            onClick={() => setIsOrbCanvasOpen(true)}
            className="p-2.5 rounded-2xl bg-[#0e0a1f]/80 border border-amber-500/40 hover:border-amber-400 backdrop-blur-3xl shadow-xl flex flex-col justify-between text-[11px] cursor-pointer group transition-all"
          >
            <div className="flex justify-between items-center border-b border-white/10 pb-1">
              <span className="font-bold text-amber-300 text-[10px]">Astra Orb</span>
              <span className="text-[8px] text-amber-400/80 font-mono group-hover:text-amber-200">Click to focus</span>
            </div>
            <div className="flex flex-col items-center justify-center my-auto py-0.5">
              <div className="w-9 h-9 rounded-full border border-amber-400/60 p-0.5 flex items-center justify-center animate-spin">
                <Sparkles className="w-4 h-4 text-amber-300" />
              </div>
            </div>
          </div>

        </div>

        {/* BOTTOM FLOATING DOCK BAR */}
        <div className="w-full flex items-center justify-center py-0.5 shrink-0">
          <div className="px-5 py-1.5 rounded-full bg-[#0e0a1f]/90 border border-white/15 backdrop-blur-3xl text-[10px] font-mono flex items-center gap-3 shadow-xl">
            <button onClick={() => setIsSettingsOpen(true)} className="text-white/60 hover:text-white">
              <SettingsIcon className="w-3.5 h-3.5" />
            </button>
            <div className="h-3 w-px bg-white/15" />
            <button onClick={onToggleVoice} className="flex items-center gap-1.5 text-amber-300 font-bold hover:text-amber-200">
              <Sparkles className="w-3 h-3 animate-pulse text-amber-400" />
              <span>Press <span className="text-white font-extrabold">★</span> to talk to Astra</span>
            </button>
            <div className="h-3 w-px bg-white/15" />
            <span className="text-white/60">⌘ K</span>
          </div>
        </div>

      </div>

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
