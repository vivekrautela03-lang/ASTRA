import React, { useState, useEffect, useRef, useCallback } from 'react';
import { AstraOrb } from '../components/astra/AstraOrb';
import { VoiceVisualizer } from '../components/astra/VoiceVisualizer';
import { TopBar } from '../components/astra/TopBar';
import { SideBar, type SidebarTab } from '../components/astra/SideBar';
import { SystemPanel } from '../components/astra/SystemPanel';
import type { ChatMessage } from '../components/astra/ChatPanel';
import { CommandBar } from '../components/astra/CommandBar';
import { QuickCommands } from '../components/astra/QuickCommands';
import { AstraChatScreen } from '../components/astra/AstraChatScreen';
import { CameraBackground } from '../components/astra/CameraBackground';
import { LiquidGlassBackground } from '../components/astra/LiquidGlassBackground';
import { AstraLogo } from '../components/astra/AstraLogo';
import { useAstraState } from '../hooks/useAstraState';
import { useVoice } from '../hooks/useVoice';
import { useCamera } from '../hooks/useCamera';
import { aiEngine } from '../services/aiEngine';
import { AstraSecurityCenter } from '../components/astra/AstraSecurityCenter';
import { AstraRoboticsHUD } from '../components/astra/AstraRoboticsHUD';
import { AstraPublicApisView } from '../components/astra/AstraPublicApisView';
import { AstraTaskStudio } from '../components/astra/AstraTaskStudio';
import { AstraSettings } from '../components/astra/AstraSettings';
import type { AIModelId } from '../types/eva';

interface DashboardProps {
  user: { email: string; name: string };
  onLogout?: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ user }) => {
  const { state, statusText, setAstraState } = useAstraState('IDLE');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentResponse] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<SidebarTab>('voice'); // Default to Voice/Living Orb Screen
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [selectedModel, setSelectedModel] = useState<AIModelId>('llama-3-70b');

  // Camera Vision Hook
  const camera = useCamera();

  const sendPromptRef = useRef<(text: string) => Promise<void>>(async () => {});
  const voiceSpeakRef = useRef<(text: string, onEnd?: () => void) => void>(() => {});

  // Master Prompt Processing
  const handleProcessPrompt = useCallback(
    async (promptText: string) => {
      const query = promptText.trim();
      if (!query) return;

      // 1. Append User Message
      const userMsg: ChatMessage = {
        id: `user-${Date.now()}`,
        sender: 'user',
        text: query,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, userMsg]);

      // 2. Set State to THINKING
      setAstraState('THINKING');

      try {
        const aiRes = await aiEngine.generateResponse(query, selectedModel);
        const replyText = aiRes.text;

        // Contextual action triggers
        const actions: ChatMessage['actions'] = [];
        const lower = query.toLowerCase();

        if (lower.includes('camera') || lower.includes('vision') || lower.includes('video') || lower.includes('ar')) {
          actions.push({
            label: camera.isActive ? 'Disable AR Camera' : 'Enable AR Camera',
            variant: 'primary',
            onClick: () => camera.toggleCamera()
          });
        }
        if (lower.includes('robot') || lower.includes('suit') || lower.includes('telemetry')) {
          actions.push({
            label: 'Open Robotics HUD',
            variant: 'primary',
            onClick: () => setActiveTab('robotics')
          });
        }
        if (lower.includes('security') || lower.includes('sandbox') || lower.includes('verify')) {
          actions.push({
            label: 'Security Center',
            variant: 'primary',
            onClick: () => setActiveTab('security')
          });
        }
        if (lower.includes('api') || lower.includes('catalog') || lower.includes('endpoint')) {
          actions.push({
            label: 'Public APIs',
            variant: 'primary',
            onClick: () => setActiveTab('apis')
          });
        }
        if (lower.includes('task') || lower.includes('studio') || lower.includes('workflow')) {
          actions.push({
            label: 'Task Studio',
            variant: 'primary',
            onClick: () => setActiveTab('tasks')
          });
        }

        const astraMsg: ChatMessage = {
          id: `astra-${Date.now()}`,
          sender: 'astra',
          text: replyText,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          actions
        };

        setMessages((prev) => [...prev, astraMsg]);

        // 3. Speaking State & TTS
        if (soundEnabled) {
          setAstraState('SPEAKING');
          voiceSpeakRef.current(replyText, () => {
            setAstraState('IDLE');
          });
        } else {
          setAstraState('IDLE');
        }
      } catch (err) {
        console.error('[ASTRA DASHBOARD ERROR]:', err);
        setAstraState('ERROR');
        setMessages((prev) => [
          ...prev,
          {
            id: `error-${Date.now()}`,
            sender: 'astra',
            text: "Neural synchronization error. Reconnecting to local gateway..."
          }
        ]);
        setTimeout(() => setAstraState('IDLE'), 3000);
      }
    },
    [setAstraState, soundEnabled, selectedModel, camera]
  );

  useEffect(() => {
    sendPromptRef.current = handleProcessPrompt;
  }, [handleProcessPrompt]);

  // Voice Hook
  const voice = useVoice((finalTranscript) => {
    sendPromptRef.current(finalTranscript);
  });

  useEffect(() => {
    voiceSpeakRef.current = voice.speak;
  }, [voice.speak]);

  const toggleVoiceMode = () => {
    if (voice.isRecording) {
      voice.stopListening();
      setAstraState('IDLE');
    } else {
      setActiveTab('voice');
      setAstraState('LISTENING');
      voice.startListening().then((ok) => {
        if (!ok) setAstraState('ERROR', 'MICROPHONE ACCESS REQUIRED');
      });
    }
  };

  const handleSelectSidebarTab = (tab: SidebarTab) => {
    if (tab === 'settings') {
      setShowSettings(true);
    } else if (tab === 'voice') {
      setActiveTab('voice');
      toggleVoiceMode();
    } else {
      setActiveTab(tab);
    }
  };

  return (
    <div className="relative w-screen h-screen bg-[#000000] text-[#E6F7FF] overflow-hidden flex flex-col font-sans select-none">
      {/* 0. Live Camera AR Background Layer */}
      {camera.isActive ? (
        <CameraBackground
          isActive={camera.isActive}
          hasPermission={camera.hasPermission}
          onEnableCamera={camera.startCamera}
          bindVideoRef={camera.bindVideoRef}
        />
      ) : (
        <LiquidGlassBackground />
      )}

      {/* 1. Liquid Glass Top Navigation Bar */}
      <TopBar
        soundEnabled={soundEnabled}
        onToggleSound={() => {
          if (soundEnabled) voice.stopSpeaking();
          setSoundEnabled(!soundEnabled);
        }}
        cameraActive={camera.isActive}
        onToggleCamera={camera.toggleCamera}
        onOpenSettings={() => setShowSettings(true)}
        userEmail={user.email}
      />

      {/* 2. Main Center Workspace */}
      <main className="relative flex-1 flex flex-col items-center justify-between px-6 pb-6 pt-2 z-10 overflow-hidden">
        {/* Liquid Glass Left Side Dock */}
        <SideBar
          activeTab={activeTab}
          onSelectTab={handleSelectSidebarTab}
        />

        {/* Liquid Glass Right Collapsible System Panel */}
        <SystemPanel
          currentMode={
            activeTab === 'chat'
              ? 'Conversational HUD'
              : camera.isActive
              ? 'AR Vision Engine'
              : activeTab === 'robotics'
              ? 'Robotics Engine'
              : activeTab === 'security'
              ? 'Security Shield'
              : 'Assistant Voice Mode'
          }
          onManageMemory={() => setActiveTab('chat')}
        />

        {/* Mode Switching: Full Chat Screen vs Voice Living Orb vs Other HUDs */}
        {activeTab === 'chat' ? (
          /* ===================================================
             MODE A: Full Dedicated ChatGPT / Gemini Style Chat
             =================================================== */
          <div className="w-full h-full flex items-center justify-center animate-in fade-in zoom-in-95 duration-300">
            <AstraChatScreen
              messages={messages}
              currentResponse={currentResponse}
              onSend={(text) => handleProcessPrompt(text)}
              onToggleVoice={toggleVoiceMode}
              isRecording={voice.isRecording}
              state={state}
              onNewChat={() => setMessages([])}
            />
          </div>
        ) : activeTab === 'robotics' ? (
          <div className="w-full max-w-4xl h-[70vh] my-auto overflow-y-auto astra-scrollbar animate-in fade-in zoom-in-95">
            <AstraRoboticsHUD />
          </div>
        ) : activeTab === 'security' ? (
          <div className="w-full max-w-4xl h-[70vh] my-auto overflow-y-auto astra-scrollbar animate-in fade-in zoom-in-95">
            <AstraSecurityCenter />
          </div>
        ) : activeTab === 'apis' ? (
          <div className="w-full max-w-4xl h-[70vh] my-auto overflow-y-auto astra-scrollbar animate-in fade-in zoom-in-95">
            <AstraPublicApisView />
          </div>
        ) : activeTab === 'tasks' ? (
          <div className="w-full max-w-4xl h-[70vh] my-auto overflow-y-auto astra-scrollbar animate-in fade-in zoom-in-95">
            <AstraTaskStudio />
          </div>
        ) : (
          /* ===================================================
             MODE B: Voice Mode / Living AI Energy Orb Experience
             =================================================== */
          <div className="relative flex-1 flex flex-col items-center justify-between w-full max-w-4xl h-full animate-in fade-in zoom-in-95 duration-300">
            {/* Center Orb & Circular Waveform */}
            <div className="relative flex-1 flex flex-col items-center justify-center -mt-4">
              <div className="relative flex items-center justify-center">
                {/* Circular Audio Waveform */}
                <VoiceVisualizer
                  state={state}
                  audioLevel={voice.audioLevel}
                  size={460}
                />

                {/* Three.js Living AI Energy Orb */}
                <AstraOrb
                  size={400}
                  color="#00BFFF"
                  state={state}
                  audioLevel={voice.audioLevel}
                  onClick={toggleVoiceMode}
                />
              </div>

              {/* Orb Status Indicator with Pure Transparent Text Logo */}
              <div className="flex flex-col items-center gap-2 mt-1 mb-2">
                <AstraLogo size="md" align="center" showSubtitle={true} />
                <div className="flex items-center gap-2 px-4 py-1.5 rounded-full liquid-glass-pill shadow-[0_0_20px_rgba(0,191,255,0.25)]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#00BFFF] animate-ping" />
                  <span className="text-[10px] font-mono tracking-widest text-cyan-300 font-semibold">
                    {statusText}
                  </span>
                </div>
              </div>
            </div>

            {/* Bottom Controls for Voice Mode */}
            <div className="w-full max-w-3xl flex flex-col items-center gap-3 mt-auto mb-2">
              {/* Liquid Glass Quick Command Chips */}
              <QuickCommands onSelectCommand={(cmd) => handleProcessPrompt(cmd)} />

              {/* Futuristic Liquid Glass Command Bar */}
              <CommandBar
                onSend={(text) => handleProcessPrompt(text)}
                onToggleVoice={toggleVoiceMode}
                isRecording={voice.isRecording}
                state={state}
                onToggleChat={() => setActiveTab('chat')}
              />
            </div>
          </div>
        )}
      </main>

      {/* Settings Modal */}
      <AstraSettings
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        selectedModel={selectedModel}
        onSelectModel={(model) => setSelectedModel(model as AIModelId)}
      />
    </div>
  );
};

export default Dashboard;
