import React, { useState, useEffect, useRef } from 'react';
import { AnimatePresence } from 'framer-motion';
import { 
  Home, MessageSquare, CheckSquare, Calendar as CalendarIcon, 
  FileText, Folder, Briefcase, Wrench, Settings as SettingsIcon,
  Mic, Moon, Clock, Sparkles, ChevronRight, Activity, Cpu, HardDrive, Wifi,
  FileCode, Layers, UserCheck
} from 'lucide-react';
import type { EvaState } from '../../types/eva';
import { AstraResponse } from './AstraResponse';
import { AstraSettings } from './AstraSettings';
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
  const [weather, setWeather] = useState<GoogleWeatherData | null>(null);
  const [ragDocsCount, setRagDocsCount] = useState(vectorStoreService.getAllDocuments().length);

  const videoRef = useRef<HTMLVideoElement>(null);
  const [currentTime, setCurrentTime] = useState('');
  const [currentDateStr, setCurrentDateStr] = useState('');

  // Dynamic Yellow Glowing Voice Line Path State
  const [wavePoints, setWavePoints] = useState<number[]>(Array(40).fill(0));

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      setCurrentDateStr(now.toLocaleDateString([], { weekday: 'short', day: 'numeric', month: 'short' }));
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

  // Update RAG doc count
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
    const height = 60;
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
    <div className="relative w-full min-h-screen bg-[#070412] text-white font-sans overflow-hidden select-none">
      
      {/* 1. SEAMLESS HARDWARE-ACCELERATED BACKGROUND VIDEO */}
      <video
        ref={videoRef}
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover z-0 filter brightness-[0.55] contrast-[1.15] saturate-[1.1] opacity-90"
        src="https://res.cloudinary.com/qia3rzqk/video/upload/v1786772058/VID-20260815-WA0003_gowuqn.mp4"
      />

      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,0,0,0.25)_0%,rgba(0,0,0,0.65)_70%,rgba(0,0,0,0.92)_100%)] pointer-events-none z-10" />

      {/* 2. MASTER DESKTOP CONTAINER */}
      <div className="relative z-20 w-full min-h-screen p-4 flex flex-col justify-between gap-4">
        
        {/* TOP BAR */}
        <div className="w-full flex items-center justify-between gap-4">
          
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500 via-yellow-400 to-amber-600 p-0.5 shadow-lg shadow-amber-500/30">
              <div className="w-full h-full rounded-[10px] bg-[#0d0926] flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
              </div>
            </div>
            <div>
              <h1 className="text-sm font-bold tracking-[0.25em] text-white uppercase">ASTRA</h1>
              <p className="text-[9px] font-mono tracking-widest text-amber-200/80 uppercase">AI PERSONAL ASSISTANT</p>
            </div>
          </div>

          {/* Center Command Search Bar */}
          <form onSubmit={handleSubmit} className="flex-1 max-w-xl flex items-center gap-2 px-4 py-2 rounded-full bg-slate-950/60 border border-white/15 backdrop-blur-2xl shadow-xl">
            <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Ask Astra anything..."
              className="flex-1 bg-transparent border-none outline-none text-xs text-white placeholder:text-white/40 font-sans"
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
            <span className="px-2 py-0.5 rounded-md bg-white/10 text-[10px] font-mono text-white/50 border border-white/10">
              Ctrl + Space
            </span>
          </form>

          {/* Right Status Badge */}
          <div className="flex items-center gap-3 px-4 py-2 rounded-full bg-slate-950/60 border border-white/15 backdrop-blur-2xl text-xs font-mono">
            <div className="flex items-center gap-1.5 text-white">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span>{currentTime}</span>
              <span className="text-white/50 text-[10px]">{currentDateStr}</span>
            </div>
            <div className="h-3 w-px bg-white/20" />
            <div className="flex items-center gap-1.5 text-white">
              <Moon className="w-3.5 h-3.5 text-cyan-300" />
              <span>{weather ? `${weather.temperature}°` : '28°'}</span>
              <span className="text-white/50 text-[10px]">{weather?.condition || 'Clear Sky'}</span>
            </div>
            <div className="h-3 w-px bg-white/20" />
            <button onClick={() => setIsSettingsOpen(true)} className="text-white/60 hover:text-white">
              <SettingsIcon className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* MAIN DESKTOP GRID */}
        <div className="w-full flex-1 grid grid-cols-12 gap-4 items-start">
          
          {/* LEFT COLUMN: NAVIGATION SIDEBAR & SYSTEM STATUS (3 COLS) */}
          <div className="col-span-3 flex flex-col gap-4">
            
            {/* Sidebar Navigation Card */}
            <div className="p-3 rounded-3xl bg-slate-950/60 border border-white/15 backdrop-blur-2xl shadow-xl flex flex-col gap-1 text-xs">
              {navItems.map(item => {
                const Icon = item.icon;
                const isActive = activeTab === item.name;
                return (
                  <button
                    key={item.name}
                    onClick={() => setActiveTab(item.name)}
                    className={`w-full px-3 py-2.5 rounded-2xl flex items-center justify-between transition-all ${
                      isActive 
                        ? 'bg-gradient-to-r from-amber-500/20 to-yellow-500/10 border border-amber-500/40 text-amber-300 font-bold' 
                        : 'text-white/70 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className={`w-4 h-4 ${isActive ? 'text-amber-400' : 'text-white/60'}`} />
                      <span>{item.name}</span>
                    </div>
                    {isActive && <ChevronRight className="w-3.5 h-3.5 text-amber-400" />}
                  </button>
                );
              })}

              {/* User Profile Badge */}
              <div className="mt-3 pt-3 border-t border-white/10 flex items-center justify-between px-2">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-amber-400 to-yellow-500 p-0.5">
                    <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center text-[10px] font-bold text-amber-300">
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
            </div>

            {/* Welcome & System Status Card */}
            <div className="p-4 rounded-3xl bg-slate-950/60 border border-white/15 backdrop-blur-2xl shadow-xl flex flex-col gap-3 text-xs">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-bold text-white text-sm">Good Evening, Vivek! 👋</h3>
                  <p className="text-[10px] text-amber-200/80 font-mono">Astra is here to help you.</p>
                </div>
              </div>

              {/* Circular Gauge & Telemetry */}
              <div className="p-3 rounded-2xl bg-black/40 border border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full border-2 border-cyan-400/80 border-t-amber-400 flex items-center justify-center font-mono font-bold text-xs text-white">
                    98%
                  </div>
                  <div>
                    <span className="font-bold text-white">System Status</span>
                    <p className="text-[10px] text-emerald-400 font-mono">Optimal Performance</p>
                  </div>
                </div>
              </div>

              {/* Resource Bars */}
              <div className="flex flex-col gap-1.5 font-mono text-[10px]">
                <div className="flex justify-between items-center">
                  <span className="text-white/60 flex items-center gap-1"><Cpu className="w-3 h-3 text-cyan-400" /> CPU</span>
                  <div className="w-24 h-1.5 rounded-full bg-white/10 overflow-hidden"><div className="w-[34%] h-full bg-cyan-400" /></div>
                  <span className="text-white">34%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-white/60 flex items-center gap-1"><Activity className="w-3 h-3 text-purple-400" /> RAM</span>
                  <div className="w-24 h-1.5 rounded-full bg-white/10 overflow-hidden"><div className="w-[62%] h-full bg-purple-400" /></div>
                  <span className="text-white">62%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-white/60 flex items-center gap-1"><HardDrive className="w-3 h-3 text-amber-400" /> Storage</span>
                  <div className="w-24 h-1.5 rounded-full bg-white/10 overflow-hidden"><div className="w-[71%] h-full bg-amber-400" /></div>
                  <span className="text-white">71%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-white/60 flex items-center gap-1"><Wifi className="w-3 h-3 text-emerald-400" /> Network</span>
                  <div className="w-24 h-1.5 rounded-full bg-white/10 overflow-hidden"><div className="w-[89%] h-full bg-emerald-400" /></div>
                  <span className="text-white">89%</span>
                </div>
              </div>
            </div>

            {/* Today's Overview & Live Weather */}
            <div className="p-4 rounded-3xl bg-slate-950/60 border border-white/15 backdrop-blur-2xl shadow-xl flex flex-col gap-2.5 text-xs">
              <div className="flex justify-between items-center border-b border-white/10 pb-2">
                <span className="font-bold text-white">Today's Overview</span>
                <span className="text-[10px] text-amber-300 font-mono cursor-pointer">View all</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
                <div className="p-2 rounded-xl bg-black/40 border border-white/10">
                  <span className="text-amber-400 font-bold">5</span> Tasks Pending
                </div>
                <div className="p-2 rounded-xl bg-black/40 border border-white/10">
                  <span className="text-cyan-400 font-bold">2</span> Meetings
                </div>
                <div className="p-2 rounded-xl bg-black/40 border border-white/10">
                  <span className="text-purple-400 font-bold">3</span> Reminders
                </div>
                <div className="p-2 rounded-xl bg-black/40 border border-white/10">
                  <span className="text-emerald-400 font-bold">1</span> Event
                </div>
              </div>
            </div>

          </div>

          {/* CENTER COLUMN: ASTRA HEADER, GLOWING WAVEFORM LINE & RESPONSE PANEL (6 COLS) */}
          <div className="col-span-6 flex flex-col items-center justify-between min-h-[580px] py-4">
            
            {/* Header Title & Glowing Yellow Waveform SVG Line */}
            <div className="flex flex-col items-center text-center">
              <h1 className="text-5xl font-light tracking-[0.38em] text-white font-sans uppercase drop-shadow-[0_4px_30px_rgba(255,255,255,0.6)]">
                ASTRA
              </h1>
              <p className="text-xs font-semibold tracking-[0.42em] text-amber-200 font-mono uppercase mt-2 drop-shadow-md">
                AI PERSONAL ASSISTANT
              </p>

              {/* Dynamic Yellow Glowing Voice Waveform SVG */}
              <div className="w-full max-w-[420px] h-14 flex items-center justify-center mt-2">
                <svg className="w-full h-full overflow-visible" viewBox="0 0 450 60">
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
            <div className="w-full max-w-xl my-auto">
              <AstraResponse
                state={state}
                responseText={lastResponseText}
                onStopSpeaking={onStopSpeaking}
              />
            </div>

            {/* Camera Overlay Modal */}
            <AnimatePresence>
              {isCameraOpen && (
                <div className="mb-4">
                  <CameraWidget isOpen={isCameraOpen} onClose={() => setIsCameraOpen(false)} />
                </div>
              )}
            </AnimatePresence>

            {/* RAG Knowledge Base Overlay */}
            <AnimatePresence>
              {isRAGOpen && (
                <div className="mb-4">
                  <KnowledgeRAGWidget />
                </div>
              )}
            </AnimatePresence>

          </div>

          {/* RIGHT COLUMN: UPCOMING SCHEDULE, ACTIVE PROJECTS & QUICK ACTIONS (3 COLS) */}
          <div className="col-span-3 flex flex-col gap-4">
            
            {/* Upcoming Schedule Card */}
            <div className="p-4 rounded-3xl bg-slate-950/60 border border-white/15 backdrop-blur-2xl shadow-xl flex flex-col gap-3 text-xs">
              <div className="flex justify-between items-center border-b border-white/10 pb-2">
                <span className="font-bold text-white">Upcoming Schedule</span>
                <span className="text-[10px] text-amber-300 font-mono cursor-pointer">View Calendar</span>
              </div>

              <div className="flex flex-col gap-2.5 font-mono text-[11px]">
                <div className="flex items-center gap-2 text-amber-300">
                  <div className="w-2 h-2 rounded-full bg-amber-400" />
                  <span className="font-bold">09:30 PM</span>
                  <span className="text-white truncate">Project Discussion (Google Meet)</span>
                </div>
                <div className="flex items-center gap-2 text-purple-300">
                  <div className="w-2 h-2 rounded-full bg-purple-400" />
                  <span className="font-bold">11:00 PM</span>
                  <span className="text-white truncate">UI/UX Architecture Review</span>
                </div>
                <div className="flex items-center gap-2 text-cyan-300">
                  <div className="w-2 h-2 rounded-full bg-cyan-400" />
                  <span className="font-bold">01:30 AM</span>
                  <span className="text-white truncate">Focus Time (Deep Work)</span>
                </div>
                <div className="flex items-center gap-2 text-emerald-300">
                  <div className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span className="font-bold">04:00 AM</span>
                  <span className="text-white truncate">Gym Workout</span>
                </div>
                <div className="flex items-center gap-2 text-pink-300">
                  <div className="w-2 h-2 rounded-full bg-pink-400" />
                  <span className="font-bold">07:00 AM</span>
                  <span className="text-white truncate">Personal Time</span>
                </div>
              </div>
            </div>

            {/* Active Projects Card */}
            <div className="p-4 rounded-3xl bg-slate-950/60 border border-white/15 backdrop-blur-2xl shadow-xl flex flex-col gap-3 text-xs">
              <div className="flex justify-between items-center border-b border-white/10 pb-2">
                <span className="font-bold text-white">Active Projects</span>
                <span className="text-[10px] text-amber-300 font-mono cursor-pointer">View all</span>
              </div>

              <div className="flex flex-col gap-2.5 text-[11px]">
                <div>
                  <div className="flex justify-between mb-1 font-mono">
                    <span className="text-white font-semibold">Oldverse Production</span>
                    <span className="text-cyan-400">78%</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden"><div className="w-[78%] h-full bg-cyan-400" /></div>
                </div>
                <div>
                  <div className="flex justify-between mb-1 font-mono">
                    <span className="text-white font-semibold">ASTRA OS</span>
                    <span className="text-amber-400">62%</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden"><div className="w-[62%] h-full bg-amber-400" /></div>
                </div>
                <div>
                  <div className="flex justify-between mb-1 font-mono">
                    <span className="text-white font-semibold">Website Redesign</span>
                    <span className="text-purple-400">40%</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden"><div className="w-[40%] h-full bg-purple-400" /></div>
                </div>
              </div>
            </div>

            {/* Quick Actions Card */}
            <div className="p-4 rounded-3xl bg-slate-950/60 border border-white/15 backdrop-blur-2xl shadow-xl flex flex-col gap-3 text-xs">
              <span className="font-bold text-white border-b border-white/10 pb-2">Quick Actions</span>
              <div className="grid grid-cols-3 gap-2 text-center text-[10px] font-mono">
                <button onClick={() => onSendPrompt('Summarize recent documents')} className="p-2 rounded-xl bg-black/40 border border-white/10 hover:border-amber-400 text-amber-200">
                  Summarize
                </button>
                <button onClick={() => onSendPrompt('Create new task')} className="p-2 rounded-xl bg-black/40 border border-white/10 hover:border-cyan-400 text-cyan-200">
                  Create Task
                </button>
                <button onClick={() => setIsRAGOpen(!isRAGOpen)} className="p-2 rounded-xl bg-black/40 border border-white/10 hover:border-purple-400 text-purple-200">
                  RAG Vault ({ragDocsCount})
                </button>
                <button onClick={() => setIsCameraOpen(!isCameraOpen)} className="p-2 rounded-xl bg-black/40 border border-white/10 hover:border-emerald-400 text-emerald-200">
                  Camera
                </button>
                <button onClick={() => onSendPrompt('Translate current text')} className="p-2 rounded-xl bg-black/40 border border-white/10 hover:border-pink-400 text-pink-200">
                  Translate
                </button>
                <button onClick={() => setIsSettingsOpen(true)} className="p-2 rounded-xl bg-black/40 border border-white/10 hover:border-white text-white">
                  Settings
                </button>
              </div>
            </div>

          </div>

        </div>

        {/* BOTTOM CARDS ROW: RECENT CONVERSATIONS, SUGGESTIONS, MEMORY LANE, VOICE & DOCK */}
        <div className="w-full grid grid-cols-12 gap-4 items-center pt-2">
          
          {/* Recent Conversations */}
          <div className="col-span-3 p-3.5 rounded-3xl bg-slate-950/60 border border-white/15 backdrop-blur-2xl shadow-xl flex flex-col gap-2 text-xs">
            <div className="flex justify-between items-center border-b border-white/10 pb-1.5">
              <span className="font-bold text-white text-[11px]">Recent Conversations</span>
              <span className="text-[9px] text-amber-300 font-mono cursor-pointer">View all</span>
            </div>
            <div className="flex flex-col gap-1.5 text-[10px] text-white/70">
              <p className="truncate hover:text-white cursor-pointer">• Create a production schedule</p>
              <p className="truncate hover:text-white cursor-pointer">• Summarize this PDF for me</p>
              <p className="truncate hover:text-white cursor-pointer">• Best places to visit in Uttarakhand</p>
            </div>
          </div>

          {/* Astra Suggestions */}
          <div className="col-span-3 p-3.5 rounded-3xl bg-slate-950/60 border border-white/15 backdrop-blur-2xl shadow-xl flex flex-col gap-2 text-xs">
            <span className="font-bold text-amber-300 text-[11px] border-b border-white/10 pb-1.5">Astra Suggestions</span>
            <div className="flex flex-col gap-1 text-[10px] text-white/80 font-mono">
              <p className="text-cyan-300">• You have a meeting in 45 mins</p>
              <p className="text-emerald-300">• System memory optimized & healthy</p>
              <p className="text-purple-300">• Auto-learning RAG indexed {ragDocsCount} documents</p>
            </div>
          </div>

          {/* Memory Lane */}
          <div className="col-span-3 p-3.5 rounded-3xl bg-slate-950/60 border border-white/15 backdrop-blur-2xl shadow-xl flex flex-col gap-2 text-xs">
            <span className="font-bold text-purple-300 text-[11px] border-b border-white/10 pb-1.5">Memory Lane (RAG Vault)</span>
            <div className="flex items-center gap-2 text-[10px] font-mono">
              <div className="p-2 rounded-xl bg-black/40 border border-white/10 flex flex-col items-center text-amber-300">
                <Folder className="w-4 h-4 mb-1" />
                <span className="truncate max-w-[60px]">Oldverse</span>
              </div>
              <div className="p-2 rounded-xl bg-black/40 border border-white/10 flex flex-col items-center text-cyan-300">
                <FileCode className="w-4 h-4 mb-1" />
                <span className="truncate max-w-[60px]">Brief.pdf</span>
              </div>
              <div className="p-2 rounded-xl bg-black/40 border border-white/10 flex flex-col items-center text-purple-300">
                <Layers className="w-4 h-4 mb-1" />
                <span className="truncate max-w-[60px]">RAG Vector</span>
              </div>
            </div>
          </div>

          {/* Astra Voice Bar & Bottom Dock Controls */}
          <div className="col-span-3 p-3.5 rounded-3xl bg-slate-950/60 border border-amber-500/30 backdrop-blur-2xl shadow-xl flex items-center justify-between gap-3 text-xs">
            <button
              onClick={onToggleVoice}
              className={`p-3 rounded-2xl flex items-center gap-2 font-bold transition-all active:scale-95 ${
                state === 'speaking' || state === 'listening'
                  ? 'bg-amber-400 text-black animate-pulse shadow-[0_0_20px_rgba(245,158,11,0.8)]'
                  : 'bg-white/10 border border-white/15 text-amber-300 hover:bg-white/20'
              }`}
            >
              <Mic className="w-4 h-4" />
              <span className="text-[11px] font-mono">{state === 'listening' ? 'Listening...' : 'Talk to Astra'}</span>
            </button>

            <button
              onClick={() => setIsSettingsOpen(true)}
              className="p-2.5 rounded-2xl bg-white/10 border border-white/15 text-white hover:bg-white/20"
              title="ASTRA System Settings"
            >
              <SettingsIcon className="w-4 h-4" />
            </button>
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
