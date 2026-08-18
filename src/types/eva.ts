export type EvaState = 
  | 'entrance' 
  | 'idle' 
  | 'listening' 
  | 'thinking' 
  | 'speaking' 
  | 'executing' 
  | 'observing' 
  | 'analyzing' 
  | 'error';

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
  | 'creative'
  | 'browser' 
  | 'vision' 
  | 'security' 
  | 'computer_control' 
  | 'workflow' 
  | 'finance'
  | 'robotics';

export type NavTabId = 
  | 'HOME'
  | 'CHAT'
  | 'TASKS'
  | 'PROJECTS'
  | 'AGENTS'
  | 'MEMORY'
  | 'COMPUTER'
  | 'VISION'
  | 'INTEGRATIONS'
  | 'PUBLIC_APIS'
  | 'DEVICES'
  | 'SECURITY'
  | 'SETTINGS';

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
  status: 'idle' | 'running' | 'completed' | 'failed' | 'waiting';
  currentTask?: string;
  progress: number;
  logs: string[];
  icon: string;
}

export interface MemoryItem {
  id: string;
  content: string;
  category: 'preference' | 'fact' | 'event' | 'code' | 'conversation' | 'action' | 'SHORT_TERM' | 'LONG_TERM' | 'PROJECT' | 'PREFERENCE' | 'SEMANTIC' | 'EPISODIC';
  confidence?: number;
  timestamp?: string;
  createdAt?: string;
  tags: string[];
  importance?: number;
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

export interface IntegrationCard {
  id: string;
  name: string;
  category: string;
  description: string;
  docUrl: string;
  status: 'Connected' | 'Not Connected' | 'Error';
  lastChecked?: string;
}

export interface SecurityAuditEntry {
  id: string;
  actionType: string;
  target: string;
  agentId: string;
  status: string;
  timestamp: string;
  evaluation?: {
    risk: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    level: string;
    reason: string;
  };
}

export interface DeviceTelemetry {
  id: string;
  name: string;
  type: 'Desktop' | 'Mobile' | 'Robotics' | 'Wearable Suit' | 'Helmet';
  connection: string;
  status: 'ONLINE' | 'PAIRED' | 'OFFLINE';
  safetyLevel: 'SAFE' | 'NOMINAL' | 'INTERLOCKED';
}
