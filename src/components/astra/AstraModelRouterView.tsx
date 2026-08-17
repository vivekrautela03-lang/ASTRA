import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Cpu, RefreshCw } from 'lucide-react';

interface ModelInfo {
  id: string;
  name: string;
  provider: string;
  costCategory: string;
  typicalLatencyMs: number;
  capabilities: string[];
  enabled: boolean;
  isDefault: boolean;
  status: string;
}

const DEFAULT_MODELS: ModelInfo[] = [
  {
    id: 'llama-3-70b',
    name: 'Groq Llama 3.3 70B Versatile',
    provider: 'Groq Cloud',
    costCategory: 'Ultra-Low',
    typicalLatencyMs: 85,
    capabilities: ['Fast Chat', 'General Reasoner', 'Tool Calling'],
    enabled: true,
    isDefault: true,
    status: 'CONNECTED'
  },
  {
    id: 'gpt-4o',
    name: 'OpenAI GPT-4o Omniscience',
    provider: 'OpenAI',
    costCategory: 'Medium',
    typicalLatencyMs: 320,
    capabilities: ['Deep Reasoning', 'Code Synthesis', 'Vision Analysis', 'Realtime Audio'],
    enabled: true,
    isDefault: false,
    status: 'CONNECTED'
  },
  {
    id: 'gemini-1-5-pro',
    name: 'Google Gemini 1.5 Pro',
    provider: 'Google AI Studio',
    costCategory: 'Low',
    typicalLatencyMs: 250,
    capabilities: ['Multimodal Vision', '2M Token Context', 'Deep Research'],
    enabled: true,
    isDefault: false,
    status: 'CONNECTED'
  },
  {
    id: 'deepseek-r1',
    name: 'DeepSeek R1 / V3 Reasoning',
    provider: 'DeepSeek AI',
    costCategory: 'Ultra-Low',
    typicalLatencyMs: 310,
    capabilities: ['Logic Trees', 'Mathematical Proofs', 'Algorithmic Optimization'],
    enabled: true,
    isDefault: false,
    status: 'CONNECTED'
  },
  {
    id: 'claude-3-5-sonnet',
    name: 'Anthropic Claude 3.5 Sonnet',
    provider: 'Anthropic',
    costCategory: 'Medium',
    typicalLatencyMs: 400,
    capabilities: ['Complex Architecture', 'Precision Coding', 'Artifact Creation'],
    enabled: true,
    isDefault: false,
    status: 'KEY_REQUIRED'
  },
  {
    id: 'ollama-local',
    name: 'Ollama Local LLM',
    provider: 'Local Host',
    costCategory: 'Free / Local',
    typicalLatencyMs: 150,
    capabilities: ['100% Offline', 'Zero Data Leakage', 'Air-Gapped Ops'],
    enabled: true,
    isDefault: false,
    status: 'CONNECTED'
  }
];

interface Props {
  selectedModel: string;
  onSelectModel: (modelId: string) => void;
}

export const AstraModelRouterView: React.FC<Props> = ({ selectedModel, onSelectModel }) => {
  const [models, setModels] = useState<ModelInfo[]>(DEFAULT_MODELS);
  const [isLoading, setIsLoading] = useState(false);

  const fetchModels = () => {
    setIsLoading(true);
    fetch('http://localhost:8990/api/settings/models')
      .then(res => res.json())
      .then(data => {
        if (data.models?.length) setModels(data.models);
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    fetchModels();
  }, []);

  return (
    <div className="w-full h-full flex flex-col p-6 space-y-6 overflow-y-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-amber-500/20 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Cpu className="w-6 h-6 text-amber-400" />
            <h1 className="text-xl font-bold text-white tracking-wide">DYNAMIC MODEL ROUTER MATRIX</h1>
          </div>
          <p className="text-xs text-white/50 mt-1">
            Cost-aware, latency-aware and task-based multi-provider AI model orchestration.
          </p>
        </div>
        <button
          onClick={fetchModels}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 text-xs font-mono transition-colors self-start md:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} /> Refresh
        </button>
      </div>

      {/* Model Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {models.map(m => {
          const isCurrentActive = selectedModel === m.id;
          const isConnected = m.status === 'CONNECTED';

          return (
            <motion.div
              key={m.id}
              whileHover={{ y: -2 }}
              className={`p-4 rounded-xl border backdrop-blur-md transition-all flex flex-col justify-between ${
                isCurrentActive
                  ? 'bg-amber-950/30 border-amber-400 ring-1 ring-amber-400/40'
                  : 'bg-black/40 border-white/10 hover:border-white/20'
              }`}
            >
              <div>
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-sm font-bold text-white">{m.name}</h2>
                    <span className="text-[10px] text-white/40 font-mono uppercase">{m.provider}</span>
                  </div>
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
                    isConnected
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                      : 'bg-white/5 text-white/40 border-white/10'
                  }`}>
                    {isConnected ? 'READY' : 'KEY REQUIRED'}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 my-3 font-mono text-[11px]">
                  <div className="p-2 rounded bg-white/5 border border-white/5">
                    <span className="text-white/40 text-[9px] block">LATENCY</span>
                    <span className="text-amber-300 font-semibold">{m.typicalLatencyMs}ms</span>
                  </div>
                  <div className="p-2 rounded bg-white/5 border border-white/5">
                    <span className="text-white/40 text-[9px] block">COST TIER</span>
                    <span className="text-emerald-300 font-semibold">{m.costCategory}</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] font-mono text-white/40">CAPABILITIES</span>
                  <div className="flex flex-wrap gap-1">
                    {m.capabilities.map((cap, i) => (
                      <span key={i} className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-white/5 text-white/70 border border-white/5">
                        {cap}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between">
                <span className="text-[10px] font-mono text-white/50">
                  {m.isDefault ? 'Default Conversational' : 'Specialist Model'}
                </span>
                <button
                  onClick={() => onSelectModel(m.id)}
                  className={`px-3 py-1 rounded font-mono text-[11px] transition-colors ${
                    isCurrentActive
                      ? 'bg-amber-400 text-black font-bold'
                      : 'bg-white/10 hover:bg-white/20 text-white'
                  }`}
                >
                  {isCurrentActive ? 'Active Model' : 'Select'}
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
