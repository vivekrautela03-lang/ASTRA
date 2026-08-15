export type EvaState = 
  | 'entrance' 
  | 'idle' 
  | 'thinking' 
  | 'speaking' 
  | 'executing' 
  | 'observing' 
  | 'analyzing';

export type AIModelId = 
  | 'claude-3-5-sonnet' 
  | 'gpt-4o' 
  | 'gemini-1-5-pro' 
  | 'deepseek-r1' 
  | 'llama-3-70b' 
  | 'ollama-local';

export type AgentRole = 
  | 'coding' 
  | 'research' 
  | 'browser' 
  | 'vision' 
  | 'security' 
  | 'computer_control' 
  | 'workflow' 
  | 'finance';

export interface SystemSettings {
  soundEnabled: boolean;
  hapticFeedback: boolean;
  gpuMode: 'high' | 'balanced' | 'power-save';
  micSensitivity: number;
  voiceModel: string;
  voiceLanguage: 'en-US' | 'hi-IN' | 'bilingual';
  auraIntensity: number;
  selectedModel: AIModelId;
  autoModelSelect: boolean;
  wakeWordEnabled: boolean;
  visionEnabled: boolean;
  autonomousMode: boolean;
  theme: 'jarvis-cyan' | 'neon-purple' | 'matrix-green' | 'amber-gold';
}

export interface PromptSuggestion {
  id: string;
  label: string;
  category: string;
  prompt: string;
  icon?: string;
}

export interface SystemTelemetryData {
  cpuUsage: number;
  gpuUsage: number;
  ramUsage: number;
  ramTotalGB: number;
  ramUsedGB: number;
  gpuTemp: number;
  vramUsedGB: number;
  networkDownMbps: number;
  networkUpMbps: number;
  batteryLevel: number;
  isCharging: boolean;
  activeProcessesCount: number;
  systemLatencyMs: number;
  fps: number;
}

export interface AIAgent {
  id: string;
  name: string;
  role: AgentRole;
  status: 'idle' | 'running' | 'completed' | 'failed';
  currentTask?: string;
  progress: number;
  logs: string[];
  icon: string;
}

export interface MemoryItem {
  id: string;
  content: string;
  category: 'preference' | 'fact' | 'event' | 'code' | 'conversation' | 'action';
  confidence: number;
  timestamp: string;
  tags: string[];
}

export interface TerminalLog {
  id: string;
  timestamp: string;
  command?: string;
  output: string;
  type: 'input' | 'output' | 'error' | 'system';
}

export interface OSAction {
  id: string;
  type: 'open_app' | 'run_script' | 'send_message' | 'schedule_task' | 'capture_screen' | 'search_web';
  title: string;
  description: string;
  status: 'pending' | 'success' | 'executing' | 'error';
  timestamp: string;
}

export interface VisionDetection {
  id: string;
  label: string;
  confidence: number;
  box: { x: number; y: number; width: number; height: number };
  category: string;
}
