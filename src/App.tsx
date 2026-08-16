import { useState, useEffect, useCallback, useRef } from 'react';
import { AstraDesktopInterface } from './components/astra/AstraDesktopInterface';
import { SettingsModal } from './components/ui/SettingsModal';
import { OSDashboard } from './components/ui/OSDashboard';
import { JarvisFloatingScreens } from './components/ui/JarvisFloatingScreens';
import { ChatHistoryCard } from './components/ui/ChatHistoryCard';
import { CameraVisionModal } from './components/ui/CameraVisionModal';
import { ConfirmationModal } from './components/ui/ConfirmationModal';
import { ProactiveAlertBanner } from './components/ui/ProactiveAlertBanner';

import type { EvaState, SystemSettings, AIModelId, SystemTelemetryData, AIAgent, VisionDetection, OSAction } from './types/eva';
import { aiEngine } from './services/aiEngine';
import { voiceVisionEngine } from './services/voiceVisionEngine';
import { textToSpeechService } from './services/speech/tts';
import { wakeWordEngine } from './services/wakeWord/wakeWordEngine';
import { toolRegistry } from './services/tools/toolRegistry';
import { ASTRA_SYSTEM_PHRASES } from './config/astraPersonality';
import { clapDetectionEngine } from './services/clapDetectionEngine';
import { safetyGatekeeper, type SafetyActionRequest } from './services/safetyGatekeeper';
import { proactiveMonitor, type ProactiveAlert } from './services/proactiveMonitorService';
import { systemTelemetry } from './services/systemTelemetry';
import { automationBridge } from './services/automationBridge';
import { memoryEngine } from './services/memoryEngine';
import { cameraVisionService } from './services/cameraVisionService';

declare global {
  interface Window {
    setEvaState?: (state: EvaState) => void;
  }
}

export function App() {
  const [state, setState] = useState<EvaState>('idle');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isDashboardOpen, setIsDashboardOpen] = useState(false);
  const [isJarvisScreensOpen, setIsJarvisScreensOpen] = useState(false);
  const [isChatHistoryOpen, setIsChatHistoryOpen] = useState(false);
  const [isCameraVisionOpen, setIsCameraVisionOpen] = useState(false);
  const [lastResponseText, setLastResponseText] = useState<string>('');
  const [hasGreeted, setHasGreeted] = useState(false);

  // Background Prompt Queue Ref for Continuous Voice Listening & Turn-Taking
  const promptQueueRef = useRef<string[]>([]);
  const isProcessingRef = useRef<boolean>(false);
  const processPromptRef = useRef<(prompt: string) => Promise<void>>(async () => {});

  // System States
  const [telemetry, setTelemetry] = useState<SystemTelemetryData>(systemTelemetry.getCurrentTelemetry());
  const [agents] = useState<AIAgent[]>(aiEngine.getInitialAgents());
  const [visionDetections] = useState<VisionDetection[]>(voiceVisionEngine.getLiveDetections());
  const [osActions, setOsActions] = useState<OSAction[]>(automationBridge.getActions());

  // Safety & Proactive States
  const [safetyRequest, setSafetyRequest] = useState<SafetyActionRequest | null>(null);
  const [proactiveAlert, setProactiveAlert] = useState<ProactiveAlert | null>(null);

  const [settings, setSettings] = useState<SystemSettings>({
    soundEnabled: true,
    hapticFeedback: true,
    gpuMode: 'high',
    micSensitivity: 80,
    voiceModel: 'astra-quantum-v8',
    voiceLanguage: 'bilingual',
    auraIntensity: 95,
    selectedModel: 'deepseek-r1',
    autoModelSelect: true,
    wakeWordEnabled: true,
    visionEnabled: true,
    autonomousMode: true,
    theme: 'jarvis-cyan'
  });

  // Helper to re-arm continuous background mic listening for turn-taking (Declared FIRST)
  const armContinuousMicListener = useCallback(() => {
    voiceVisionEngine.startListening((transcript, isFinal) => {
      if (!isFinal && transcript.trim()) {
        if (!isProcessingRef.current) {
          setState('listening');
        }
        setLastResponseText(`Listening: "${transcript}"...`);
      } else if (isFinal && transcript.trim()) {
        if (isProcessingRef.current) {
          promptQueueRef.current.push(transcript.trim());
          setLastResponseText(`Queued next question: "${transcript}"`);
        } else {
          processPromptRef.current(transcript.trim());
        }
      }
    });
  }, []);

  // Expose setEvaState to window object for global controller access
  useEffect(() => {
    window.setEvaState = (newState: EvaState) => {
      setState(newState);
    };
  }, []);

  // Global User Interaction Audio & Mic Unlocker (Bypasses Browser Autoplay Restrictions)
  useEffect(() => {
    const handleFirstClick = () => {
      textToSpeechService.speak(' ');
      armContinuousMicListener();
    };
    window.addEventListener('click', handleFirstClick);
    return () => window.removeEventListener('click', handleFirstClick);
  }, [armContinuousMicListener]);

  // Subscriptions
  useEffect(() => {
    const unsubTelemetry = systemTelemetry.subscribe(data => setTelemetry(data));
    const unsubSafety = safetyGatekeeper.subscribe(req => setSafetyRequest(req));
    const unsubProactive = proactiveMonitor.subscribe(alert => setProactiveAlert(alert));
    proactiveMonitor.startMonitoring();

    return () => {
      unsubTelemetry();
      unsubSafety();
      unsubProactive();
      proactiveMonitor.stopMonitoring();
    };
  }, []);

  // Core Prompt Processor with Tool Orchestration, Streaming & Queue Drainage
  const processPrompt = useCallback(async (promptText: string) => {
    isProcessingRef.current = true;
    const lower = promptText.toLowerCase().trim();

    // Check for explicit "stop" voice interruption command
    if (lower === 'stop' || lower === 'stop speaking' || lower === 'quiet' || lower === 'silence') {
      textToSpeechService.stop();
      isProcessingRef.current = false;
      setState('idle');
      setLastResponseText(ASTRA_SYSTEM_PHRASES.stopSpeaking);
      armContinuousMicListener();
      return;
    }

    // Re-arm microphone in background while responding so next question can be queued
    armContinuousMicListener();

    // 1. Evaluate Tool Registry for tool execution (Weather, Time, Special Day, Camera, Search)
    const toolResult = await toolRegistry.evaluateAndExecute(promptText);

    if (toolResult.executed && toolResult.resultSummary) {
      if (toolResult.actionRequested === 'open_camera') {
        setIsCameraVisionOpen(true);
      }
      setLastResponseText(toolResult.resultSummary);
      setState('speaking');

      if (settings.soundEnabled) {
        textToSpeechService.speak(toolResult.resultSummary, () => {
          isProcessingRef.current = false;
          if (promptQueueRef.current.length > 0) {
            const nextPrompt = promptQueueRef.current.shift()!;
            processPromptRef.current(nextPrompt);
          } else {
            setState('idle');
            armContinuousMicListener();
          }
        });
      }
      return;
    }

    // 2. Camera vision / object recognition direct directives
    if (lower.includes('camera') || lower.includes('holding') || lower.includes('surroundings') || lower.includes('what am i holding') || lower.includes('check environment')) {
      setIsCameraVisionOpen(true);
      setState('thinking');
      setLastResponseText("Opening camera vision feed and scanning surroundings for you, Boss...");
      
      const analysis = await cameraVisionService.analyzeSurroundingsAndObject('Identify object in hand and surroundings');
      const ackText = `Boss, I am scanning your camera. You are holding a ${analysis.objectHeld}. ${analysis.surroundings.substring(0, 160)}`;
      
      setLastResponseText(ackText);
      setState('speaking');
      if (settings.soundEnabled) {
        textToSpeechService.speak(ackText, () => {
          isProcessingRef.current = false;
          if (promptQueueRef.current.length > 0) {
            const nextPrompt = promptQueueRef.current.shift()!;
            processPromptRef.current(nextPrompt);
          } else {
            setState('idle');
            armContinuousMicListener();
          }
        });
      }
      return;
    }

    // 3. Universal App Opening directive handler
    if (lower.startsWith('open ') || lower.startsWith('launch ')) {
      const targetApp = lower.replace('open ', '').replace('launch ', '');
      const result = automationBridge.launchApplication(targetApp);
      
      const ackText = `Opening ${result.title} for you now, Boss.`;
      setLastResponseText(ackText);
      setState('speaking');
      memoryEngine.addMemory(`User: ${promptText} | ASTRA: Opened ${result.title}`, 'action', ['app-launcher']);
      
      if (settings.soundEnabled) {
        textToSpeechService.speak(ackText, () => {
          isProcessingRef.current = false;
          if (promptQueueRef.current.length > 0) {
            const nextPrompt = promptQueueRef.current.shift()!;
            processPromptRef.current(nextPrompt);
          } else {
            setState('idle');
            armContinuousMicListener();
          }
        });
      }
      return;
    }

    // 4. Visual processing status
    setState('thinking');
    setLastResponseText(`ASTRA thinking: "${promptText}"...`);

    const recommendation = aiEngine.selectOptimalModel(promptText);
    const chosenModel: AIModelId = settings.autoModelSelect ? recommendation.modelId : settings.selectedModel;
    
    if (settings.autoModelSelect && chosenModel !== settings.selectedModel) {
      setSettings(prev => ({ ...prev, selectedModel: chosenModel }));
    }

    // 5. Generate response from Live Multi-API Engine with progressive streaming text
    const res = await aiEngine.generateResponse(promptText, chosenModel, (chunk) => {
      setLastResponseText(chunk);
    });
    
    memoryEngine.addMemory(`User: ${promptText} | ASTRA: ${res.text.substring(0, 150)}...`, 'conversation', ['q-and-a']);

    // 6. Speak response out loud & drain prompt queue for next question
    setLastResponseText(res.text);
    setState('speaking');

    if (settings.soundEnabled) {
      textToSpeechService.speak(res.text, () => {
        isProcessingRef.current = false;

        if (promptQueueRef.current.length > 0) {
          const nextPrompt = promptQueueRef.current.shift()!;
          processPromptRef.current(nextPrompt);
        } else {
          setState('idle');
          armContinuousMicListener();
        }
      });
    } else {
      setTimeout(() => {
        isProcessingRef.current = false;
        if (promptQueueRef.current.length > 0) {
          const nextPrompt = promptQueueRef.current.shift()!;
          processPromptRef.current(nextPrompt);
        } else {
          setState('idle');
          armContinuousMicListener();
        }
      }, 3500);
    }
  }, [settings.autoModelSelect, settings.selectedModel, settings.soundEnabled, armContinuousMicListener]);

  // Sync processPromptRef
  useEffect(() => {
    processPromptRef.current = processPrompt;
  }, [processPrompt]);

  // Initial greeting trigger helper (Triggers ONLY ONCE on launch)
  const triggerInitialGreeting = useCallback(() => {
    if (hasGreeted) return;
    setHasGreeted(true);
    const greeting = voiceVisionEngine.getGreeting();
    setLastResponseText(greeting);
    setState('speaking');
    isProcessingRef.current = true;

    textToSpeechService.speak(greeting, () => {
      isProcessingRef.current = false;
      setState('idle');
      armContinuousMicListener();
    });
  }, [hasGreeted, armContinuousMicListener]);

  useEffect(() => {
    if (!hasGreeted) {
      triggerInitialGreeting();
    }
  }, [hasGreeted, triggerInitialGreeting]);

  // Handle Prompt Submission (Multi-Model Routing + Voice TTS Response)
  const handleSendPrompt = useCallback(async (promptText: string) => {
    if (promptText.toLowerCase().includes('del /f') || promptText.toLowerCase().includes('format') || promptText.toLowerCase().includes('rm -rf')) {
      safetyGatekeeper.requestAuthorization(
        'Execute System Deletion Directive',
        `User requested dangerous operation: "${promptText}". Require explicit authorization.`,
        `powershell -Command "${promptText}"`,
        async () => {
          await processPromptRef.current(promptText);
        },
        () => {
          setState('idle');
          setLastResponseText('Directive cancelled by user safety gatekeeper.');
        }
      );
    } else {
      if (isProcessingRef.current) {
        promptQueueRef.current.push(promptText.trim());
        setLastResponseText(`Queued next question: "${promptText}"`);
      } else {
        await processPromptRef.current(promptText);
      }
    }
  }, []);

  // Handle Direct Execution from HUD Screens
  const handleExecuteCommand = async (cmd: string) => {
    await automationBridge.executeCommand(cmd);
    setOsActions(automationBridge.getActions());
    setLastResponseText(`Executed directive: ${cmd}`);
  };

  // Clap Activation Engine listener (Active ONLY when idle)
  useEffect(() => {
    if (state === 'idle') {
      clapDetectionEngine.start(settings.micSensitivity, (clapType) => {
        if (clapType === 'single' || clapType === 'double') {
          setState('listening');
          armContinuousMicListener();
        } else if (clapType === 'triple') {
          setIsJarvisScreensOpen(true);
          setIsDashboardOpen(true);
          setLastResponseText('EMERGENCY MODE ACTIVATED: Holographic display array deployed.');
        }
      });
    } else {
      clapDetectionEngine.stop();
    }

    return () => {
      clapDetectionEngine.stop();
    };
  }, [state, settings.micSensitivity, armContinuousMicListener]);

  // Wake-word Listener Effect ("Hey ASTRA" -> Wakes -> Speaks "Yes, Boss. I'm listening." -> Arm Mic)
  useEffect(() => {
    if (settings.wakeWordEnabled && state === 'idle') {
      wakeWordEngine.startListening(() => {
        wakeWordEngine.stopListening();
        setState('speaking');
        setLastResponseText(ASTRA_SYSTEM_PHRASES.wakeAck);
        
        textToSpeechService.speak(ASTRA_SYSTEM_PHRASES.wakeAck, () => {
          setState('listening');
          armContinuousMicListener();
        });
      });
    } else {
      wakeWordEngine.stopListening();
    }

    return () => {
      wakeWordEngine.stopListening();
    };
  }, [state, settings.wakeWordEnabled, armContinuousMicListener]);

  // Handle Voice Toggle (Mic Button)
  const handleToggleVoice = useCallback(() => {
    if (state === 'speaking') {
      textToSpeechService.stop();
      setState('idle');
      armContinuousMicListener();
    } else if (state === 'idle' || state === 'listening') {
      setState('listening');
      armContinuousMicListener();
    }
  }, [state, armContinuousMicListener]);

  const handleStopSpeaking = useCallback(() => {
    textToSpeechService.stop();
    setState('idle');
    armContinuousMicListener();
  }, [armContinuousMicListener]);

  const handleUpdateSettings = (newSettings: Partial<SystemSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  };

  return (
    <div className="relative w-full min-h-screen bg-[#080518]">
      {/* Main Transparent Glass Desktop Interface */}
      <AstraDesktopInterface
        state={state}
        onSetEvaState={(newState) => setState(newState)}
        onSendPrompt={handleSendPrompt}
        lastResponseText={lastResponseText}
        onToggleVoice={handleToggleVoice}
        onStopSpeaking={handleStopSpeaking}
        selectedModel={settings.selectedModel}
        onSelectModel={(model) => setSettings(prev => ({ ...prev, selectedModel: model as AIModelId }))}
      />

      {/* Proactive Alert Toast */}
      <ProactiveAlertBanner
        alert={proactiveAlert}
        onDismiss={() => proactiveMonitor.dismissAlert()}
      />

      {/* 3D Floating Holographic HUD Screens Layer */}
      <JarvisFloatingScreens
        isOpen={isJarvisScreensOpen}
        onClose={() => setIsJarvisScreensOpen(false)}
        telemetry={telemetry}
        agents={agents}
        visionDetections={visionDetections}
        osActions={osActions}
        onExecuteCommand={handleExecuteCommand}
      />

      {/* Persistent Chat History Cards Modal Layer */}
      <ChatHistoryCard
        isOpen={isChatHistoryOpen}
        onClose={() => setIsChatHistoryOpen(false)}
      />

      {/* Live WebCam Spatial Camera Vision Modal Layer */}
      <CameraVisionModal
        isOpen={isCameraVisionOpen}
        onClose={() => setIsCameraVisionOpen(false)}
      />

      {/* Jarvis Command & Control Dashboard */}
      <OSDashboard
        isOpen={isDashboardOpen}
        onClose={() => setIsDashboardOpen(false)}
        state={state}
        settings={settings}
        onUpdateSettings={handleUpdateSettings}
        onSendPrompt={handleSendPrompt}
      />

      {/* High-Risk Action Safety Confirmation Modal */}
      <ConfirmationModal request={safetyRequest} />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onUpdateSettings={handleUpdateSettings}
      />
    </div>
  );
}

export default App;
