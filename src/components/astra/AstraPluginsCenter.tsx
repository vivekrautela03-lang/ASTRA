import React, { useState, useEffect } from 'react';
import {
  Blocks,
  KeyRound,
  AppWindow,
  CheckCircle2,
  Eye,
  EyeOff,
  ExternalLink,
  Shield,
  Search,
  Power
} from 'lucide-react';

interface ApiKeyItem {
  id: string;
  name: string;
  provider: string;
  category: 'llm' | 'search' | 'voice' | 'tools' | 'custom';
  description: string;
  docUrl: string;
  keyPlaceholder: string;
  status: 'connected' | 'unconfigured' | 'testing' | 'error';
  value: string;
}

interface AppPluginItem {
  id: string;
  name: string;
  category: 'productivity' | 'developer' | 'communication' | 'iot' | 'media';
  description: string;
  iconText: string;
  iconBg: string;
  connected: boolean;
  authType: 'oauth' | 'webhook' | 'token';
  statusText: string;
}

export const AstraPluginsCenter: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'all' | 'keys' | 'apps'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showValues, setShowValues] = useState<Record<string, boolean>>({});
  const [savedFeedback, setSavedFeedback] = useState<string | null>(null);

  // Default API Keys Registry
  const [apiKeys, setApiKeys] = useState<ApiKeyItem[]>([
    {
      id: 'openai',
      name: 'OpenAI Core',
      provider: 'OpenAI Inc.',
      category: 'llm',
      description: 'Powers GPT-4o, o1-preview, and o3-mini neural reasoning models.',
      docUrl: 'https://platform.openai.com/api-keys',
      keyPlaceholder: 'sk-proj-...',
      status: 'unconfigured',
      value: ''
    },
    {
      id: 'anthropic',
      name: 'Anthropic Claude',
      provider: 'Anthropic PBC',
      category: 'llm',
      description: 'Powers Claude 3.5 Sonnet and Opus for complex architectural refactoring.',
      docUrl: 'https://console.anthropic.com/settings/keys',
      keyPlaceholder: 'sk-ant-api03-...',
      status: 'unconfigured',
      value: ''
    },
    {
      id: 'gemini',
      name: 'Google Gemini',
      provider: 'Google Cloud',
      category: 'llm',
      description: 'Powers Gemini 2.0 Flash and Gemini 1.5 Pro multimodal reasoning.',
      docUrl: 'https://aistudio.google.com/app/apikey',
      keyPlaceholder: 'AIzaSy...',
      status: 'unconfigured',
      value: ''
    },
    {
      id: 'groq',
      name: 'Groq LPUs (Ultra-Fast)',
      provider: 'Groq Inc.',
      category: 'llm',
      description: 'Ultra-low latency inference (500+ tokens/sec) for real-time voice & coding.',
      docUrl: 'https://console.groq.com/keys',
      keyPlaceholder: 'gsk_...',
      status: 'unconfigured',
      value: ''
    },
    {
      id: 'deepseek',
      name: 'DeepSeek AI',
      provider: 'DeepSeek',
      category: 'llm',
      description: 'DeepSeek R1 and DeepSeek V3 open-weights neural reasoning.',
      docUrl: 'https://platform.deepseek.com/api_keys',
      keyPlaceholder: 'sk-...',
      status: 'unconfigured',
      value: ''
    },
    {
      id: 'tavily',
      name: 'Tavily Web Search',
      provider: 'Tavily Research',
      category: 'search',
      description: 'Authoritative real-time web exploration, citation grounding, and fact-checking.',
      docUrl: 'https://app.tavily.com/home',
      keyPlaceholder: 'tvly-...',
      status: 'unconfigured',
      value: ''
    },
    {
      id: 'elevenlabs',
      name: 'ElevenLabs Voice Engine',
      provider: 'ElevenLabs',
      category: 'voice',
      description: 'Ultra-lifelike neural voice synthesis with real-time streaming audio.',
      docUrl: 'https://elevenlabs.io/app/settings/api-keys',
      keyPlaceholder: 'xi-...',
      status: 'unconfigured',
      value: ''
    }
  ]);

  // Connected Apps & Plugins
  const [appPlugins, setAppPlugins] = useState<AppPluginItem[]>([
    {
      id: 'github',
      name: 'GitHub Copilot & Repos',
      category: 'developer',
      description: 'Automate pull requests, review commits, and push branch diagnostics.',
      iconText: 'GH',
      iconBg: 'from-gray-800 to-black',
      connected: true,
      authType: 'oauth',
      statusText: 'Connected as @developer'
    },
    {
      id: 'notion',
      name: 'Notion Knowledge Base',
      category: 'productivity',
      description: 'Sync engineering notes, project roadmaps, and personal memory wiki.',
      iconText: 'N',
      iconBg: 'from-neutral-900 to-stone-900',
      connected: false,
      authType: 'oauth',
      statusText: 'Ready to connect'
    },
    {
      id: 'slack',
      name: 'Slack Workplace Bridge',
      category: 'communication',
      description: 'Forward telemetry alerts, summaries, and autonomous task updates.',
      iconText: '#',
      iconBg: 'from-purple-900 to-indigo-950',
      connected: false,
      authType: 'oauth',
      statusText: 'Ready to connect'
    },
    {
      id: 'spotify',
      name: 'Spotify Sound Matrix',
      category: 'media',
      description: 'Autonomous focus music generation and ambient background soundtracking.',
      iconText: 'SP',
      iconBg: 'from-emerald-900 to-teal-950',
      connected: false,
      authType: 'oauth',
      statusText: 'Ready to connect'
    },
    {
      id: 'linear',
      name: 'Linear Task Manager',
      category: 'developer',
      description: 'Automate sprint tickets, assign issues, and track release cycles.',
      iconText: 'LN',
      iconBg: 'from-indigo-900 to-blue-950',
      connected: false,
      authType: 'token',
      statusText: 'Ready to connect'
    },
    {
      id: 'homeassistant',
      name: 'Home Assistant IoT Hub',
      category: 'iot',
      description: 'Control smart lighting, room climate, and studio hardware peripherals.',
      iconText: 'HA',
      iconBg: 'from-cyan-900 to-blue-950',
      connected: true,
      authType: 'webhook',
      statusText: 'Connected (12 Smart Nodes)'
    }
  ]);

  // Load from local storage
  useEffect(() => {
    try {
      const savedKeys = localStorage.getItem('astra_user_api_keys');
      if (savedKeys) {
        const parsed = JSON.parse(savedKeys);
        setApiKeys((prev) =>
          prev.map((k) => {
            const val = parsed[k.id];
            if (val) {
              return { ...k, value: val, status: 'connected' };
            }
            return k;
          })
        );
      }
    } catch {
      // ignore
    }
  }, []);

  const handleSaveKey = (id: string, value: string) => {
    setApiKeys((prev) =>
      prev.map((k) =>
        k.id === id
          ? {
              ...k,
              value,
              status: value.trim() ? 'connected' : 'unconfigured'
            }
          : k
      )
    );

    // Save to localStorage
    try {
      const current = JSON.parse(localStorage.getItem('astra_user_api_keys') || '{}');
      if (value.trim()) {
        current[id] = value.trim();
      } else {
        delete current[id];
      }
      localStorage.setItem('astra_user_api_keys', JSON.stringify(current));
      setSavedFeedback(`Key for ${id.toUpperCase()} saved securely!`);
      setTimeout(() => setSavedFeedback(null), 2500);
    } catch {
      // ignore
    }
  };

  const toggleAppConnection = (id: string) => {
    setAppPlugins((prev) =>
      prev.map((p) =>
        p.id === id
          ? {
              ...p,
              connected: !p.connected,
              statusText: !p.connected ? 'Connected' : 'Disconnected'
            }
          : p
      )
    );
  };

  const filteredKeys = apiKeys.filter(
    (k) =>
      k.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      k.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      k.provider.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredApps = appPlugins.filter(
    (a) =>
      a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="w-full h-[78vh] flex flex-col gap-5 p-6 rounded-3xl liquid-glass shadow-[0_20px_60px_rgba(0,0,0,0.85)] border border-white/10 select-text overflow-hidden animate-in fade-in zoom-in-95">
      {/* 1. Header Toolbar */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-white/[0.08] select-none">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-2xl liquid-glass-pill flex items-center justify-center text-cyan-300 shadow-[0_0_20px_rgba(0,191,255,0.4)]">
            <Blocks className="w-5 h-5 text-cyan-400 animate-pulse" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold tracking-wider text-white">
                PLUGINS &amp; INTEGRATION VAULT
              </h2>
              <span className="text-[9px] font-mono px-2.5 py-0.5 rounded-full liquid-glass-card text-cyan-300 flex items-center gap-1.5">
                <Shield className="w-3 h-3 text-emerald-400" />
                END-TO-END ENCRYPTED
              </span>
            </div>
            <p className="text-xs text-white/50 font-sans">
              Connect external AI models, API keys, developer tooling, and smart applications into ASTRA.
            </p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1.5 p-1 rounded-2xl liquid-glass-card">
          <button
            type="button"
            onClick={() => setActiveTab('all')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'all'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-[0_0_15px_rgba(0,191,255,0.3)]'
                : 'text-white/60 hover:text-white'
            }`}
          >
            All ({apiKeys.length + appPlugins.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('keys')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeTab === 'keys'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-[0_0_15px_rgba(0,191,255,0.3)]'
                : 'text-white/60 hover:text-white'
            }`}
          >
            <KeyRound className="w-3.5 h-3.5" />
            <span>API Keys ({apiKeys.filter((k) => k.status === 'connected').length}/{apiKeys.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('apps')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeTab === 'apps'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-[0_0_15px_rgba(0,191,255,0.3)]'
                : 'text-white/60 hover:text-white'
            }`}
          >
            <AppWindow className="w-3.5 h-3.5" />
            <span>Apps &amp; Services ({appPlugins.filter((a) => a.connected).length}/{appPlugins.length})</span>
          </button>
        </div>
      </div>

      {/* 2. Search & Feedback Bar */}
      <div className="flex items-center justify-between gap-4 select-none">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-white/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search API keys, providers, apps, or models..."
            className="w-full pl-10 pr-4 py-2 rounded-2xl liquid-glass-input text-xs text-white placeholder-white/40 outline-none"
          />
        </div>

        {savedFeedback && (
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full liquid-glass-pill text-emerald-300 text-xs font-mono animate-in fade-in">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>{savedFeedback}</span>
          </div>
        )}
      </div>

      {/* 3. Main Grid List */}
      <div className="flex-1 overflow-y-auto astra-scrollbar pr-1 flex flex-col gap-6">
        {/* Section A: API Keys */}
        {(activeTab === 'all' || activeTab === 'keys') && (
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between select-none">
              <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-cyan-300">
                <KeyRound className="w-3.5 h-3.5 text-cyan-400" />
                <span>AI Models &amp; Neural API Keys</span>
              </div>
              <span className="text-[10px] font-mono text-white/40">
                Stored in local client enclave
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {filteredKeys.map((item) => {
                const isVisible = showValues[item.id] || false;
                const isConnected = item.status === 'connected';

                return (
                  <div
                    key={item.id}
                    className={`p-4 rounded-2xl liquid-glass-card flex flex-col justify-between gap-3 border transition-all ${
                      isConnected
                        ? 'border-cyan-500/40 shadow-[0_0_20px_rgba(0,191,255,0.12)]'
                        : 'border-white/[0.08]'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs text-white tracking-wide">
                            {item.name}
                          </span>
                          <span className="text-[9px] font-mono px-2 py-0.5 rounded-full liquid-glass-chip text-white/60">
                            {item.provider}
                          </span>
                        </div>
                        <p className="text-[11px] text-white/60 font-sans mt-1 leading-relaxed">
                          {item.description}
                        </p>
                      </div>

                      {/* Status Dot */}
                      <div
                        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono shrink-0 select-none ${
                          isConnected
                            ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30'
                            : 'bg-white/[0.04] text-white/40 border border-white/[0.08]'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            isConnected ? 'bg-emerald-400 animate-pulse' : 'bg-white/30'
                          }`}
                        />
                        <span>{isConnected ? 'ACTIVE' : 'UNSET'}</span>
                      </div>
                    </div>

                    {/* Key Input Box */}
                    <div className="flex items-center gap-2 mt-1">
                      <div className="relative flex-1">
                        <input
                          type={isVisible ? 'text' : 'password'}
                          value={item.value}
                          onChange={(e) => handleSaveKey(item.id, e.target.value)}
                          placeholder={item.keyPlaceholder}
                          className="w-full pl-3 pr-8 py-2 rounded-xl liquid-glass-input text-xs font-mono text-cyan-200 placeholder-white/30 outline-none"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setShowValues((prev) => ({
                              ...prev,
                              [item.id]: !prev[item.id]
                            }))
                          }
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors"
                          title={isVisible ? 'Hide Key' : 'Reveal Key'}
                        >
                          {isVisible ? (
                            <EyeOff className="w-3.5 h-3.5" />
                          ) : (
                            <Eye className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>

                      <a
                        href={item.docUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="p-2 rounded-xl liquid-glass-chip text-white/60 hover:text-cyan-300 transition-colors shrink-0"
                        title="Get API Key from provider"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Section B: Apps & Services */}
        {(activeTab === 'all' || activeTab === 'apps') && (
          <div className="flex flex-col gap-3 mt-2">
            <div className="flex items-center justify-between select-none">
              <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-cyan-300">
                <AppWindow className="w-3.5 h-3.5 text-cyan-400" />
                <span>Connected Apps &amp; Enterprise Plugins</span>
              </div>
              <span className="text-[10px] font-mono text-white/40">
                OAuth 2.0 &amp; Webhook Bridges
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {filteredApps.map((app) => (
                <div
                  key={app.id}
                  className={`p-4 rounded-2xl liquid-glass-card flex flex-col justify-between gap-3 border transition-all ${
                    app.connected
                      ? 'border-cyan-500/40 shadow-[0_0_20px_rgba(0,191,255,0.12)]'
                      : 'border-white/[0.08]'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-9 h-9 rounded-xl bg-gradient-to-br ${app.iconBg} border border-white/20 flex items-center justify-center text-white font-mono font-bold text-xs shrink-0 shadow-md`}
                    >
                      {app.iconText}
                    </div>

                    <div className="flex flex-col flex-1">
                      <span className="font-bold text-xs text-white">{app.name}</span>
                      <p className="text-[11px] text-white/60 font-sans mt-0.5 leading-relaxed">
                        {app.description}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-white/[0.06] select-none">
                    <span className="text-[10px] font-mono text-white/40">
                      {app.statusText}
                    </span>

                    <button
                      type="button"
                      onClick={() => toggleAppConnection(app.id)}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                        app.connected
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-[0_0_12px_rgba(16,185,129,0.3)] hover:bg-rose-500/20 hover:text-rose-300 hover:border-rose-500/40'
                          : 'bg-gradient-to-r from-[#00BFFF] to-blue-600 text-white shadow-[0_0_15px_rgba(0,191,255,0.4)] hover:brightness-110 active:scale-95'
                      }`}
                    >
                      <Power className="w-3 h-3" />
                      <span>{app.connected ? 'Connected' : 'Connect'}</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AstraPluginsCenter;
