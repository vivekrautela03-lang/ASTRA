import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Activity, Terminal, Database, Eye, Cpu, 
  X, Send, Sparkles, Trash2, 
  Search, CheckCircle2, RefreshCw, Command,
  Video, Bot
} from 'lucide-react';
import type { 
  EvaState, SystemSettings, SystemTelemetryData, AIAgent, 
  MemoryItem, TerminalLog, OSAction, AIModelId, VisionDetection 
} from '../../types/eva';
import { MODEL_REGISTRY, aiEngine } from '../../services/aiEngine';
import { systemTelemetry } from '../../services/systemTelemetry';
import { memoryEngine } from '../../services/memoryEngine';
import { automationBridge } from '../../services/automationBridge';
import { voiceVisionEngine } from '../../services/voiceVisionEngine';

interface OSDashboardProps {
  isOpen: boolean;
  onClose: () => void;
  state: EvaState;
  settings: SystemSettings;
  onUpdateSettings: (newSettings: Partial<SystemSettings>) => void;
  onSendPrompt: (prompt: string) => void;
}

export const OSDashboard: React.FC<OSDashboardProps> = ({
  isOpen,
  onClose,
  state,
  settings,
  onUpdateSettings,
  onSendPrompt
}) => {
  const [activeTab, setActiveTab] = useState<'telemetry' | 'agents' | 'terminal' | 'memory' | 'vision' | 'automation' | 'models'>('telemetry');
  
  // Real-time states
  const [telemetry, setTelemetry] = useState<SystemTelemetryData>(systemTelemetry.getCurrentTelemetry());
  const [agents, setAgents] = useState<AIAgent[]>(aiEngine.getInitialAgents());
  const [memories, setMemories] = useState<MemoryItem[]>(memoryEngine.getMemories());
  const [memoryQuery, setMemoryQuery] = useState('');
  const [terminalLogs, setTerminalLogs] = useState<TerminalLog[]>(automationBridge.getTerminalLogs());
  const [terminalInput, setTerminalInput] = useState('');
  const [osActions, setOsActions] = useState<OSAction[]>(automationBridge.getActions());
  const [visionDetections] = useState<VisionDetection[]>(voiceVisionEngine.getLiveDetections());
  const [newMemoryInput, setNewMemoryInput] = useState('');
  const [isWebcamActive, setIsWebcamActive] = useState(true);

  // Telemetry Subscription
  useEffect(() => {
    const unsubscribe = systemTelemetry.subscribe((data) => setTelemetry(data));
    return () => unsubscribe();
  }, []);

  // Handle Terminal Submit
  const handleTerminalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!terminalInput.trim()) return;
    const cmd = terminalInput;
    setTerminalInput('');
    await automationBridge.executeCommand(cmd);
    setTerminalLogs(automationBridge.getTerminalLogs());
    setOsActions(automationBridge.getActions());
  };

  // Add Memory
  const handleAddMemory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemoryInput.trim()) return;
    memoryEngine.addMemory(newMemoryInput, 'fact', ['user-note']);
    setNewMemoryInput('');
    setMemories(memoryEngine.getMemories());
  };

  // Delete Memory
  const handleDeleteMemory = (id: string) => {
    memoryEngine.deleteMemory(id);
    setMemories(memoryEngine.getMemories());
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        className="fixed inset-4 md:inset-8 z-50 flex flex-col glass-card bg-[#020617]/90 border border-cyan-500/30 rounded-2xl shadow-2xl backdrop-blur-2xl text-white overflow-hidden"
      >
        {/* Top Jarvis Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-cyan-500/20 bg-cyan-950/20">
          <div className="flex items-center gap-3">
            <div className="relative flex items-center justify-center w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-400/40 text-cyan-400">
              <Sparkles className="w-5 h-5 animate-pulse" />
              <div className="absolute inset-0 rounded-xl bg-cyan-400/20 blur-md -z-10" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-extrabold tracking-wider font-mono text-cyan-300">
                  ASTRA OS :: STARK COMMAND CENTER
                </h2>
                <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-400 border border-cyan-400/30">
                  v8.4 ONLINE ({state})
                </span>
              </div>
              <p className="text-xs text-white/50 font-mono">
                Multimodal AI Operating System • Latency: {telemetry.systemLatencyMs}ms • FPS: {telemetry.fps}
              </p>
            </div>
          </div>

          {/* Quick Active Model Pill */}
          <div className="hidden md:flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs font-mono">
              <Bot className="w-4 h-4 text-cyan-400" />
              <span className="text-white/60">Active LLM:</span>
              <span className="text-cyan-400 font-bold">{MODEL_REGISTRY[settings.selectedModel].name}</span>
            </div>
            <button 
              onClick={onClose}
              className="p-2 rounded-xl bg-white/5 hover:bg-red-500/20 text-white/70 hover:text-red-400 border border-white/10 hover:border-red-500/40 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Middle Body: Sidebar Navigation & Content Panel */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Navigation Rail */}
          <div className="w-16 md:w-64 border-r border-cyan-500/20 bg-black/40 flex flex-col justify-between p-3">
            <div className="space-y-1.5">
              {[
                { id: 'telemetry', label: 'System Telemetry', icon: Activity, badge: `${telemetry.cpuUsage}%` },
                { id: 'agents', label: 'Autonomous Agents', icon: Bot, badge: `${agents.length}` },
                { id: 'terminal', label: 'Execution Terminal', icon: Terminal, badge: 'PowerShell' },
                { id: 'memory', label: 'Knowledge Graph', icon: Database, badge: `${memories.length}` },
                { id: 'vision', label: 'Multimodal Vision', icon: Eye, badge: 'Live' },
                { id: 'automation', label: 'Computer Control', icon: Command, badge: 'OS' },
                { id: 'models', label: 'AI Model Matrix', icon: Cpu, badge: 'Multi' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`w-full flex items-center justify-between p-3 rounded-xl transition-all text-xs font-mono font-medium ${
                    activeTab === tab.id 
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 shadow-[0_0_15px_rgba(6,182,212,0.15)]' 
                      : 'text-white/60 hover:text-white hover:bg-white/5 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <tab.icon className={`w-4 h-4 ${activeTab === tab.id ? 'text-cyan-400' : 'text-white/50'}`} />
                    <span className="hidden md:inline">{tab.label}</span>
                  </div>
                  <span className="hidden md:inline text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/5 text-cyan-400 border border-white/10">
                    {tab.badge}
                  </span>
                </button>
              ))}
            </div>

            {/* Quick Voice & Theme Pill */}
            <div className="hidden md:block p-3 rounded-xl bg-cyan-950/30 border border-cyan-500/20 font-mono text-xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-white/60">Voice Mode:</span>
                <span className="text-cyan-400 font-bold uppercase">{settings.voiceLanguage}</span>
              </div>
              <button
                onClick={() => onUpdateSettings({ 
                  voiceLanguage: settings.voiceLanguage === 'bilingual' ? 'en-US' : settings.voiceLanguage === 'en-US' ? 'hi-IN' : 'bilingual' 
                })}
                className="w-full py-1.5 px-2 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-400/30 text-[11px] text-center transition-colors"
              >
                Switch Language
              </button>
            </div>
          </div>

          {/* Right Main Dashboard Workspace */}
          <div className="flex-1 p-4 md:p-6 overflow-y-auto bg-black/20">
            {/* TAB 1: TELEMETRY & HARDWARE MONITOR */}
            {activeTab === 'telemetry' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-mono text-cyan-400 uppercase tracking-widest flex items-center gap-2">
                    <Activity className="w-4 h-4 text-cyan-400" /> Real-time System Telemetry & Hardware Gauges
                  </h3>
                  <span className="text-xs text-white/50 font-mono">Sampling Rate: 1000ms</span>
                </div>

                {/* Grid Metrics */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { label: 'CPU Usage', value: `${telemetry.cpuUsage}%`, color: 'from-cyan-500 to-blue-500', bar: telemetry.cpuUsage },
                    { label: 'GPU Utilization', value: `${telemetry.gpuUsage}%`, color: 'from-emerald-500 to-teal-500', bar: telemetry.gpuUsage },
                    { label: 'RAM Allocated', value: `${telemetry.ramUsedGB} GB / ${telemetry.ramTotalGB} GB`, color: 'from-purple-500 to-indigo-500', bar: telemetry.ramUsage },
                    { label: 'GPU Temperature', value: `${telemetry.gpuTemp}°C`, color: 'from-amber-500 to-orange-500', bar: (telemetry.gpuTemp / 100) * 100 }
                  ].map((m, idx) => (
                    <div key={idx} className="p-4 rounded-xl glass-pill border border-cyan-500/20 bg-cyan-950/10">
                      <p className="text-xs text-white/60 font-mono mb-1">{m.label}</p>
                      <p className="text-xl font-extrabold font-mono text-white mb-2">{m.value}</p>
                      <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                        <div 
                          className={`h-full bg-gradient-to-r ${m.color} transition-all duration-500`} 
                          style={{ width: `${m.bar}%` }} 
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Detailed Secondary Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 rounded-xl border border-cyan-500/20 bg-white/5 font-mono text-xs space-y-2">
                    <div className="flex justify-between">
                      <span className="text-white/60">Network Download:</span>
                      <span className="text-cyan-400 font-bold">{telemetry.networkDownMbps} Mbps</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/60">Network Upload:</span>
                      <span className="text-emerald-400 font-bold">{telemetry.networkUpMbps} Mbps</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/60">Active OS Threads:</span>
                      <span className="text-white font-bold">{telemetry.activeProcessesCount}</span>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl border border-cyan-500/20 bg-white/5 font-mono text-xs space-y-2">
                    <div className="flex justify-between">
                      <span className="text-white/60">Battery Power:</span>
                      <span className="text-emerald-400 font-bold">{telemetry.batteryLevel}% (Charging)</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/60">VRAM Allocation:</span>
                      <span className="text-purple-400 font-bold">{telemetry.vramUsedGB} GB</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/60">IPC Kernel Latency:</span>
                      <span className="text-cyan-300 font-bold">{telemetry.systemLatencyMs} ms</span>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl border border-cyan-500/20 bg-cyan-950/20 font-mono text-xs flex flex-col justify-between">
                    <div>
                      <p className="text-cyan-400 font-bold mb-1">Jarvis Health Sentinel</p>
                      <p className="text-white/60 text-[11px]">All system subagents operating nominal. Zero thermal throttling detected.</p>
                    </div>
                    <div className="flex items-center gap-2 mt-3 text-emerald-400 font-semibold text-[11px]">
                      <CheckCircle2 className="w-4 h-4" /> 100% Operational Status
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: AUTONOMOUS AGENTS */}
            {activeTab === 'agents' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-mono text-cyan-400 uppercase tracking-widest flex items-center gap-2">
                    <Bot className="w-4 h-4 text-cyan-400" /> Active Autonomous AI Subagent Matrix
                  </h3>
                  <button 
                    onClick={() => setAgents(aiEngine.getInitialAgents())}
                    className="px-3 py-1 rounded-lg bg-cyan-500/20 text-cyan-300 border border-cyan-400/30 text-xs font-mono flex items-center gap-1.5 hover:bg-cyan-500/30 transition-colors"
                  >
                    <RefreshCw className="w-3.5 h-3.5" /> Refresh Agents
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {agents.map((ag) => (
                    <div key={ag.id} className="p-4 rounded-xl border border-cyan-500/20 bg-cyan-950/10 font-mono">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className={`w-2.5 h-2.5 rounded-full ${ag.status === 'running' ? 'bg-emerald-400 animate-ping' : 'bg-cyan-400'}`} />
                          <span className="text-sm font-bold text-white">{ag.name}</span>
                        </div>
                        <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                          ag.status === 'running' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-400/30' : 'bg-cyan-500/20 text-cyan-400 border border-cyan-400/30'
                        }`}>
                          {ag.status}
                        </span>
                      </div>

                      {ag.currentTask && (
                        <p className="text-xs text-cyan-300/80 mb-2 italic">Task: {ag.currentTask}</p>
                      )}

                      <div className="w-full bg-white/10 h-1 rounded-full overflow-hidden mb-3">
                        <div className="bg-cyan-400 h-full transition-all duration-300" style={{ width: `${ag.progress}%` }} />
                      </div>

                      <div className="space-y-1 text-[11px] text-white/50 border-t border-white/10 pt-2">
                        {ag.logs.map((log, lIdx) => (
                          <div key={lIdx} className="flex items-center gap-1.5">
                            <span className="text-cyan-500">›</span> {log}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 3: EXECUTION TERMINAL */}
            {activeTab === 'terminal' && (
              <div className="h-full flex flex-col space-y-3 font-mono">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm text-cyan-400 uppercase tracking-widest flex items-center gap-2">
                    <Terminal className="w-4 h-4 text-cyan-400" /> Interactive OS PowerShell / Command Line
                  </h3>
                  <span className="text-xs text-white/40">Type 'help' for command directory</span>
                </div>

                {/* Terminal Console Box */}
                <div className="flex-1 min-h-[300px] p-4 rounded-xl bg-black/80 border border-cyan-500/30 overflow-y-auto text-xs space-y-2 select-text">
                  {terminalLogs.map((log) => (
                    <div key={log.id} className="leading-relaxed">
                      <span className="text-white/40 text-[10px] mr-2">[{log.timestamp}]</span>
                      {log.type === 'input' && <span className="text-cyan-400 font-bold">{log.output}</span>}
                      {log.type === 'output' && <span className="text-emerald-300 whitespace-pre-wrap">{log.output}</span>}
                      {log.type === 'system' && <span className="text-purple-300 italic">{log.output}</span>}
                    </div>
                  ))}
                </div>

                {/* Terminal Prompt Form */}
                <form onSubmit={handleTerminalSubmit} className="flex items-center gap-2">
                  <span className="text-cyan-400 font-bold text-sm">$</span>
                  <input
                    type="text"
                    value={terminalInput}
                    onChange={(e) => setTerminalInput(e.target.value)}
                    placeholder="Enter command e.g. sysinfo, scan, launch vscode..."
                    className="flex-1 px-4 py-2.5 rounded-xl bg-white/5 border border-cyan-500/30 text-xs text-white placeholder-white/40 focus:outline-none focus:border-cyan-400"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-400/40 text-xs font-bold transition-colors flex items-center gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5" /> Execute
                  </button>
                </form>
              </div>
            )}

            {/* TAB 4: KNOWLEDGE GRAPH & VECTOR MEMORY */}
            {activeTab === 'memory' && (
              <div className="space-y-4 font-mono">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
                  <h3 className="text-sm text-cyan-400 uppercase tracking-widest flex items-center gap-2">
                    <Database className="w-4 h-4 text-cyan-400" /> Vector Database Memory & Knowledge RAG
                  </h3>
                  
                  {/* Search Bar */}
                  <div className="relative w-full md:w-64">
                    <Search className="w-3.5 h-3.5 text-white/40 absolute left-3 top-3" />
                    <input
                      type="text"
                      value={memoryQuery}
                      onChange={(e) => setMemoryQuery(e.target.value)}
                      placeholder="Search neural memories..."
                      className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs text-white placeholder-white/40 focus:outline-none focus:border-cyan-400"
                    />
                  </div>
                </div>

                {/* Add New Memory Form */}
                <form onSubmit={handleAddMemory} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={newMemoryInput}
                    onChange={(e) => setNewMemoryInput(e.target.value)}
                    placeholder="Add explicit user preference or knowledge fact to long-term memory..."
                    className="flex-1 px-3 py-2 rounded-xl bg-cyan-950/30 border border-cyan-500/20 text-xs text-white placeholder-white/40 focus:outline-none focus:border-cyan-400"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-400/30 text-xs font-bold transition-colors"
                  >
                    + Store Memory
                  </button>
                </form>

                {/* Memory Cards Grid */}
                <div className="space-y-3">
                  {memoryEngine.searchMemories(memoryQuery).map((mem) => (
                    <div key={mem.id} className="p-4 rounded-xl border border-cyan-500/20 bg-cyan-950/10 flex items-start justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-400 border border-cyan-400/30">
                            {mem.category}
                          </span>
                          <span className="text-[10px] text-white/40">{mem.timestamp || mem.createdAt}</span>
                          <span className="text-[10px] text-emerald-400 font-bold">Confidence: {((mem.confidence ?? 1) * 100).toFixed(0)}%</span>
                        </div>
                        <p className="text-xs text-white/90 leading-relaxed">{mem.content}</p>
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {mem.tags.map((t, tIdx) => (
                            <span key={tIdx} className="text-[9px] px-1.5 py-0.5 rounded bg-white/5 text-white/50">
                              #{t}
                            </span>
                          ))}
                        </div>
                      </div>
                      <button
                        onClick={() => handleDeleteMemory(mem.id)}
                        className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors"
                        title="Delete memory node"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 5: MULTIMODAL VISION ENGINE */}
            {activeTab === 'vision' && (
              <div className="space-y-4 font-mono">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm text-cyan-400 uppercase tracking-widest flex items-center gap-2">
                    <Eye className="w-4 h-4 text-cyan-400" /> Multimodal Live Camera & Screen OCR Perception
                  </h3>
                  <button
                    onClick={() => setIsWebcamActive(!isWebcamActive)}
                    className="px-3 py-1 rounded-lg bg-cyan-500/20 text-cyan-300 border border-cyan-400/30 text-xs flex items-center gap-1.5"
                  >
                    <Video className="w-3.5 h-3.5" /> {isWebcamActive ? 'Pause Stream' : 'Activate Stream'}
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Simulated Camera Feed with Target Overlay */}
                  <div className="md:col-span-2 relative h-64 rounded-xl border border-cyan-500/30 bg-black overflow-hidden flex items-center justify-center">
                    <div className="absolute inset-0 bg-gradient-to-tr from-cyan-950/40 to-transparent" />
                    
                    {/* Grid Overlay Shader Simulation */}
                    <div className="absolute inset-0 bg-[radial-gradient(#00f0ff_1px,transparent_1px)] [background-size:16px_16px] opacity-20" />
                    
                    {/* Live Bounding Boxes */}
                    {isWebcamActive && visionDetections.map((det) => (
                      <div
                        key={det.id}
                        className="absolute border-2 border-cyan-400 bg-cyan-500/10 rounded transition-all duration-500 flex flex-col justify-between p-1"
                        style={{
                          left: `${det.box.x}%`,
                          top: `${det.box.y}%`,
                          width: `${det.box.width}%`,
                          height: `${det.box.height}%`
                        }}
                      >
                        <span className="text-[9px] font-bold text-cyan-300 bg-black/80 px-1 rounded w-max">
                          {det.label} ({Math.round(det.confidence * 100)}%)
                        </span>
                      </div>
                    ))}

                    <div className="text-center z-10">
                      <CameraFeedIcon />
                      <p className="text-xs text-cyan-300 mt-2 font-bold">LIVE PERCEPTION FEED ACTIVE</p>
                      <p className="text-[10px] text-white/50">60 FPS Real-time Vision Transformer Pipeline</p>
                    </div>
                  </div>

                  {/* Detection Logs */}
                  <div className="space-y-2">
                    <p className="text-xs text-white/60 font-bold mb-2">Detected Spatial Objects:</p>
                    {visionDetections.map((det) => (
                      <div key={det.id} className="p-3 rounded-lg bg-white/5 border border-cyan-500/20 text-xs">
                        <div className="flex justify-between font-bold text-cyan-300 mb-0.5">
                          <span>{det.label}</span>
                          <span>{(det.confidence * 100).toFixed(0)}%</span>
                        </div>
                        <p className="text-[10px] text-white/50">Category: {det.category}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 6: COMPUTER CONTROL & OS AUTOMATION */}
            {activeTab === 'automation' && (
              <div className="space-y-4 font-mono">
                <h3 className="text-sm text-cyan-400 uppercase tracking-widest flex items-center gap-2">
                  <Command className="w-4 h-4 text-cyan-400" /> Desktop Automation & OS Control Bridge
                </h3>

                {/* Quick Shortcuts */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    { title: 'Launch VS Code', cmd: 'launch vscode', desc: 'Open project IDE' },
                    { title: 'Launch Chrome', cmd: 'launch chrome', desc: 'Web Browser Agent' },
                    { title: 'Run System Audit', cmd: 'sysinfo', desc: 'Telemetry check' },
                    { title: 'Capture Screen', cmd: 'scan', desc: 'OCR Vision Scan' }
                  ].map((btn, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        automationBridge.executeCommand(btn.cmd);
                        setTerminalLogs(automationBridge.getTerminalLogs());
                        setOsActions(automationBridge.getActions());
                      }}
                      className="p-3 rounded-xl border border-cyan-500/20 bg-cyan-950/20 hover:bg-cyan-500/20 transition-colors text-left group"
                    >
                      <p className="text-xs font-bold text-white group-hover:text-cyan-300">{btn.title}</p>
                      <p className="text-[10px] text-white/50">{btn.desc}</p>
                    </button>
                  ))}
                </div>

                {/* Action Execution History */}
                <div className="space-y-2 pt-2">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold text-white/70">Recent OS Action Directives:</p>
                    <button 
                      onClick={() => onSendPrompt('Run full system automation scan')}
                      className="text-[11px] text-cyan-400 font-bold hover:underline"
                    >
                      Trigger Workflow Automation
                    </button>
                  </div>
                  {osActions.map((act) => (
                    <div key={act.id} className="p-3 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between text-xs">
                      <div>
                        <p className="font-bold text-white">{act.title}</p>
                        <p className="text-[10px] text-white/50">{act.description}</p>
                      </div>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-400/30">
                        {act.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 7: AI MODEL MATRIX & SETTINGS */}
            {activeTab === 'models' && (
              <div className="space-y-4 font-mono">
                <h3 className="text-sm text-cyan-400 uppercase tracking-widest flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-cyan-400" /> Multi-Model Dynamic AI Engine Selection
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {(Object.keys(MODEL_REGISTRY) as AIModelId[]).map((mId) => {
                    const m = MODEL_REGISTRY[mId];
                    const isSelected = settings.selectedModel === mId;
                    return (
                      <div
                        key={mId}
                        onClick={() => onUpdateSettings({ selectedModel: mId })}
                        className={`p-4 rounded-xl border cursor-pointer transition-all ${
                          isSelected 
                            ? 'bg-cyan-500/20 border-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.2)]' 
                            : 'bg-white/5 border-white/10 hover:border-white/30'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-bold text-white" style={{ color: m.color }}>
                            {m.name}
                          </span>
                          <span className="text-[10px] px-2 py-0.5 rounded bg-white/10 text-white/70">
                            {m.provider}
                          </span>
                        </div>
                        <p className="text-xs text-white/60 mb-3">{m.bestFor}</p>
                        {isSelected && (
                          <div className="flex items-center gap-1.5 text-xs text-cyan-400 font-bold">
                            <CheckCircle2 className="w-4 h-4" /> Active Model Selected
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

const CameraFeedIcon = () => (
  <div className="w-12 h-12 mx-auto rounded-full bg-cyan-500/20 border border-cyan-400/50 flex items-center justify-center text-cyan-400 animate-pulse">
    <Eye className="w-6 h-6" />
  </div>
);
