import React, { useState, useEffect, useRef, useCallback } from 'react';
import type { EvaState, SystemSettings, AIModelId, SystemTelemetryData } from './types/eva';
import { speechToTextService } from './services/speech/stt';
import { textToSpeechService } from './services/speech/tts';
import { aiEngine } from './services/aiEngine';
import { memoryEngine } from './services/memoryEngine';
import { automationBridge } from './services/automationBridge';
import { systemTelemetry } from './services/systemTelemetry';
import { toolRegistry } from './services/tools/toolRegistry';
import { cameraVisionService } from './services/cameraVisionService';
import { wakeWordEngine } from './services/wakeWord/wakeWordEngine';
import { ASTRA_SYSTEM_PHRASES } from './config/astraPersonality';
import { AstraDesktopInterface } from './components/astra/AstraDesktopInterface';

export const App: React.FC = () => {
  // Global ASTRA state: idle | listening | thinking | speaking
  const [state, setState] = useState<EvaState>('idle');
  const [lastResponseText, setLastResponseText] = useState<string>(
    "ASTRA OS v9.0 Quantum Active. Ready for your command, Boss."
  );

  // Core settings state
  const [settings, setSettings] = useState<SystemSettings>({
    autoModelSelect: true,
    selectedModel: 'llama-3-70b',
    soundEnabled: true,
    hapticFeedback: true,
    gpuMode: 'high',
    micSensitivity: 85,
    voiceModel: 'alloy',
    voiceLanguage: 'en-US',
    auraIntensity: 90,
    wakeWordEnabled: true,
    visionEnabled: true,
    autonomousMode: true,
    theme: 'amber-gold'
  });

  const [, setLiveStats] = useState<SystemTelemetryData | null>(null);

  // Background listening and prompt queue refs
  const promptQueueRef = useRef<string[]>([]);
  const isProcessingRef = useRef<boolean>(false);

  // Forward ref for processPrompt to break circular dependency
  const processPromptRef = useRef<(prompt: string) => Promise<void>>(async () => {});

  // Live System Telemetry Stream (CPU, GPU, RAM, Network)
  useEffect(() => {
    systemTelemetry.startTelemetryStream(1000);
    const unsub = systemTelemetry.subscribe((stats: SystemTelemetryData) => {
      setLiveStats(stats);
    });
    return () => {
      unsub();
      systemTelemetry.stopTelemetryStream();
    };
  }, []);

  // Continuous background wake-word listener ("Hey ASTRA")
  const armWakeWordListener = useCallback(() => {
    if (settings.wakeWordEnabled && wakeWordEngine.isAvailable()) {
      wakeWordEngine.startListening(() => {
        setState('listening');
        const ackPhrase = ASTRA_SYSTEM_PHRASES.wakeAck;
        setLastResponseText(ackPhrase);

        if (settings.soundEnabled) {
          textToSpeechService.speak(ackPhrase, () => {
            speechToTextService.startListening((transcript: string, isFinal: boolean) => {
              if (isFinal && transcript.trim()) {
                speechToTextService.stopListening();
                processPromptRef.current(transcript.trim());
              }
            });
          });
        } else {
          speechToTextService.startListening((transcript: string, isFinal: boolean) => {
            if (isFinal && transcript.trim()) {
              speechToTextService.stopListening();
              processPromptRef.current(transcript.trim());
            }
          });
        }
      });
    }
  }, [settings.wakeWordEnabled, settings.soundEnabled]);

  useEffect(() => {
    armWakeWordListener();
    return () => {
      wakeWordEngine.stopListening();
      speechToTextService.stopListening();
    };
  }, [armWakeWordListener]);

  // Master Prompt Processing Pipeline with Natural Language Intent Execution
  const processPrompt = useCallback(async (promptText: string) => {
    isProcessingRef.current = true;
    const lower = promptText.toLowerCase().trim();

    // 1. Check for explicit "stop" voice interruption command
    if (lower === 'stop' || lower === 'stop speaking' || lower === 'quiet' || lower === 'silence') {
      textToSpeechService.stop();
      isProcessingRef.current = false;
      setState('idle');
      setLastResponseText(ASTRA_SYSTEM_PHRASES.stopSpeaking);
      armWakeWordListener();
      return;
    }

    // 2. Volume & Audio Control Directives
    if (lower.includes('mute') || lower.includes('unmute') || lower.includes('volume up') || lower.includes('volume down') || lower.includes('increase volume') || lower.includes('decrease volume')) {
      let level: 'mute' | 'up' | 'down' = 'mute';
      if (lower.includes('up') || lower.includes('increase')) level = 'up';
      else if (lower.includes('down') || lower.includes('decrease')) level = 'down';
      
      const resMsg = await automationBridge.setVolume(level);
      const ackText = `Yes, Boss. ${resMsg}`;
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
            armWakeWordListener();
          }
        });
      }
      return;
    }

    // 3. Play Song / Music Directive
    if (lower.startsWith('play ') || lower.startsWith('play song ')) {
      const songQuery = lower.replace('play song ', '').replace('play ', '');
      const ackText = `Playing "${songQuery}" for you on YouTube, Boss.`;
      setLastResponseText(ackText);
      setState('speaking');

      automationBridge.playSong('youtube', { query: songQuery }).catch(() => {});

      if (settings.soundEnabled) {
        textToSpeechService.speak(ackText, () => {
          isProcessingRef.current = false;
          if (promptQueueRef.current.length > 0) {
            const nextPrompt = promptQueueRef.current.shift()!;
            processPromptRef.current(nextPrompt);
          } else {
            setState('idle');
            armWakeWordListener();
          }
        });
      }
      return;
    }

    // 4. Evaluate Tool Registry for tool execution (Weather, Time, Special Day, Camera, Search)
    const toolResult = await toolRegistry.evaluateAndExecute(promptText);

    if (toolResult.executed && toolResult.resultSummary) {
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
            armWakeWordListener();
          }
        });
      }
      return;
    }

    // 5. Camera vision / object recognition direct directives
    if (lower.includes('camera') || lower.includes('holding') || lower.includes('surroundings') || lower.includes('what am i holding') || lower.includes('check environment')) {
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
            armWakeWordListener();
          }
        });
      }
      return;
    }

    // 6. Universal App Opening directive handler
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
            armWakeWordListener();
          }
        });
      }
      return;
    }

    // 7. Visual processing status
    setState('thinking');
    setLastResponseText(`ASTRA thinking: "${promptText}"...`);

    const recommendation = aiEngine.selectOptimalModel(promptText);
    const chosenModel: AIModelId = settings.autoModelSelect ? recommendation.modelId : settings.selectedModel;
    
    if (settings.autoModelSelect && chosenModel !== settings.selectedModel) {
      setSettings((prev: SystemSettings) => ({ ...prev, selectedModel: chosenModel }));
    }

    // 8. Generate response from Live Multi-API Engine with progressive streaming text
    const res = await aiEngine.generateResponse(promptText, chosenModel, (chunk) => {
      setLastResponseText(chunk);
    });
    
    memoryEngine.addMemory(`User: ${promptText} | ASTRA: ${res.text.substring(0, 150)}...`, 'conversation', ['q-and-a']);

    // 9. Speak response out loud & drain prompt queue for next question
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
          armWakeWordListener();
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
          armWakeWordListener();
        }
      }, 3500);
    }
  }, [settings.autoModelSelect, settings.selectedModel, settings.soundEnabled, armWakeWordListener]);

  // Sync processPromptRef
  useEffect(() => {
    processPromptRef.current = processPrompt;
  }, [processPrompt]);

  // Manual Microphone Button Toggle Trigger
  const handleToggleVoice = () => {
    if (state === 'listening') {
      speechToTextService.stopListening();
      setState('idle');
      armWakeWordListener();
    } else if (state === 'speaking') {
      textToSpeechService.stop();
      setState('idle');
      armWakeWordListener();
    } else {
      setState('listening');
      setLastResponseText(ASTRA_SYSTEM_PHRASES.listening);

      speechToTextService.startListening((transcript: string, isFinal: boolean) => {
        if (isFinal && transcript.trim()) {
          speechToTextService.stopListening();
          processPromptRef.current(transcript.trim());
        }
      });
    }
  };

  const handleStopSpeaking = () => {
    textToSpeechService.stop();
    setState('idle');
    armWakeWordListener();
  };

  return (
    <div className="relative w-full h-screen bg-[#05030d] text-white overflow-hidden select-none">
      {/* Master ASTRA Desktop OS Interface */}
      <AstraDesktopInterface
        state={state}
        onSetEvaState={setState}
        onSendPrompt={processPrompt}
        lastResponseText={lastResponseText}
        onToggleVoice={handleToggleVoice}
        onStopSpeaking={handleStopSpeaking}
        selectedModel={settings.selectedModel}
        onSelectModel={(model) => setSettings((prev: SystemSettings) => ({ ...prev, selectedModel: model as AIModelId }))}
      />
    </div>
  );
};

export default App;
