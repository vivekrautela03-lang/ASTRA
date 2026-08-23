import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import type { OrbState } from '../../registry/orbe/nebula-orb/types';
import { useAudioLevel } from '../../registry/lib/useAudioLevel';
import { aiEngine } from '../../services/aiEngine';
import { speechToTextService } from '../../services/speech/stt';
import { textToSpeechService } from '../../services/speech/tts';

export type AssistantUIState =
  | 'idle'
  | 'activating'
  | 'listening'
  | 'thinking'
  | 'speaking'
  | 'text-response'
  | 'error';

export interface ActionButton {
  label: string;
  action: () => void;
  variant?: 'primary' | 'secondary';
}

export interface UseAstraAssistantOptions {
  onExecuteAction?: (actionName: string, payload?: unknown) => void;
  greeting?: string;
}

export function useAstraAssistant(options: UseAstraAssistantOptions = {}) {
  const [isOpen, setIsOpen] = useState(false);
  const [uiState, setUiState] = useState<AssistantUIState>('idle');
  const [userQuery, setUserQuery] = useState<string | null>(null);
  const [assistantResponse, setAssistantResponse] = useState<string | null>(null);
  const [actionButtons, setActionButtons] = useState<ActionButton[]>([]);
  const [statusMessage, setStatusMessage] = useState<string>('Ask me anything.');
  const [inputText, setInputText] = useState<string>('');

  // Audio level hook for microphone amplitude
  const {
    levelRef,
    isRecording,
    permissionError,
    startListening: startAudioListening,
    stopListening: stopAudioListening
  } = useAudioLevel();

  const isProcessingRef = useRef(false);
  const sendPromptRef = useRef<(prompt: string) => Promise<void>>(async () => {});

  // Map AssistantUIState to Nebula OrbState
  const orbState: OrbState = useMemo(() => {
    switch (uiState) {
      case 'activating':
        return 'connecting';
      case 'listening':
        return 'listening';
      case 'thinking':
        return 'thinking';
      case 'speaking':
        return 'speaking';
      case 'error':
        return 'error';
      case 'idle':
      case 'text-response':
      default:
        return 'idle';
    }
  }, [uiState]);

  // Generate dynamic contextual action buttons based on prompt / response
  const detectActions = useCallback((prompt: string, responseText: string): ActionButton[] => {
    const actions: ActionButton[] = [];
    const lowerP = prompt.toLowerCase();
    const lowerR = responseText.toLowerCase();

    if (lowerP.includes('project') || lowerR.includes('project')) {
      actions.push({
        label: 'Open Projects',
        variant: 'primary',
        action: () => {
          if (options.onExecuteAction) options.onExecuteAction('open_projects');
        }
      });
      actions.push({
        label: 'View Tasks',
        variant: 'secondary',
        action: () => {
          if (options.onExecuteAction) options.onExecuteAction('open_tasks');
        }
      });
    }

    if (lowerP.includes('security') || lowerR.includes('security') || lowerP.includes('permission')) {
      actions.push({
        label: 'Security Center',
        variant: 'primary',
        action: () => {
          if (options.onExecuteAction) options.onExecuteAction('open_security');
        }
      });
    }

    if (lowerP.includes('robot') || lowerP.includes('suit') || lowerR.includes('telemetry')) {
      actions.push({
        label: 'Robotics HUD',
        variant: 'primary',
        action: () => {
          if (options.onExecuteAction) options.onExecuteAction('open_robotics');
        }
      });
    }

    if (lowerP.includes('api') || lowerR.includes('public api')) {
      actions.push({
        label: 'Public APIs',
        variant: 'primary',
        action: () => {
          if (options.onExecuteAction) options.onExecuteAction('open_public_apis');
        }
      });
    }

    return actions;
  }, [options]);

  // Send prompt to AI Engine & speak response
  const sendPrompt = useCallback(async (promptStr: string) => {
    const query = promptStr.trim();
    if (!query || isProcessingRef.current) return;

    isProcessingRef.current = true;
    setUserQuery(query);
    setInputText('');
    setUiState('thinking');
    setStatusMessage('Thinking...');
    setActionButtons([]);
    setAssistantResponse(null);

    // Stop voice listener during thinking
    stopAudioListening();
    speechToTextService.stopListening();

    try {
      // Stream chunks into response view
      const result = await aiEngine.generateResponse(query, undefined, (chunk) => {
        setAssistantResponse(chunk);
      });

      const fullAnswer = result.text || 'Yes, boss. Directive completed.';
      setAssistantResponse(fullAnswer);
      setUiState('speaking');
      setStatusMessage('Astra is speaking...');

      // Detect action buttons
      const detected = detectActions(query, fullAnswer);
      setActionButtons(detected);

      // Speak response out loud using TTS
      textToSpeechService.speak(fullAnswer, () => {
        setUiState('text-response');
        setStatusMessage('Ask me anything.');
        isProcessingRef.current = false;
      });
    } catch {
      setUiState('error');
      setStatusMessage('Something went wrong. Try again.');
      setAssistantResponse('Yes, boss. An error occurred while processing the neural pipeline. Please try again.');
      isProcessingRef.current = false;
    }
  }, [detectActions, stopAudioListening]);

  // Sync ref
  useEffect(() => {
    sendPromptRef.current = sendPrompt;
  }, [sendPrompt]);

  // Open the expanded assistant
  const openAssistant = useCallback((startVoice = false) => {
    setIsOpen(true);
    if (startVoice) {
      setUiState('listening');
      setStatusMessage('Listening...');
      startAudioListening().then((success) => {
        if (success) {
          speechToTextService.startListening((transcript, isFinal) => {
            if (isFinal && transcript.trim()) {
              speechToTextService.stopListening();
              stopAudioListening();
              sendPromptRef.current(transcript.trim());
            }
          });
        } else {
          setUiState('error');
          setStatusMessage('Microphone access required.');
        }
      });
    } else {
      setUiState('idle');
      setStatusMessage('Ask Astra anything.');
    }
  }, [startAudioListening, stopAudioListening]);

  // Minimize assistant back to floating small orb
  const minimizeAssistant = useCallback(() => {
    stopAudioListening();
    speechToTextService.stopListening();
    textToSpeechService.stop();
    setIsOpen(false);
    setUiState('idle');
  }, [stopAudioListening]);

  // Close assistant
  const closeAssistant = useCallback(() => {
    minimizeAssistant();
  }, [minimizeAssistant]);

  // Toggle voice mode
  const toggleVoice = useCallback(() => {
    if (uiState === 'listening' || isRecording) {
      stopAudioListening();
      speechToTextService.stopListening();
      setUiState('idle');
      setStatusMessage('Ask me anything.');
    } else if (uiState === 'speaking') {
      textToSpeechService.stop();
      setUiState('text-response');
      setStatusMessage('Ask me anything.');
    } else {
      setIsOpen(true);
      setUiState('listening');
      setStatusMessage('Listening...');
      startAudioListening().then((success) => {
        if (success) {
          speechToTextService.startListening((transcript, isFinal) => {
            if (isFinal && transcript.trim()) {
              speechToTextService.stopListening();
              stopAudioListening();
              sendPromptRef.current(transcript.trim());
            }
          });
        } else {
          setUiState('error');
          setStatusMessage('Microphone access required.');
        }
      });
    }
  }, [uiState, isRecording, startAudioListening, stopAudioListening]);

  // Global Keyboard shortcut listener: Ctrl+Space / Cmd+Space / Alt+Space
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isCtrlSpace = (e.ctrlKey || e.metaKey) && (e.code === 'Space' || e.key === ' ');
      const isAltSpace = e.altKey && (e.code === 'Space' || e.key === ' ');

      if (isCtrlSpace || isAltSpace) {
        e.preventDefault();
        setIsOpen((prev) => {
          if (!prev) {
            setTimeout(() => {
              setUiState('listening');
              setStatusMessage('Listening...');
              startAudioListening().then((success) => {
                if (success) {
                  speechToTextService.startListening((transcript, isFinal) => {
                    if (isFinal && transcript.trim()) {
                      speechToTextService.stopListening();
                      stopAudioListening();
                      sendPromptRef.current(transcript.trim());
                    }
                  });
                }
              });
            }, 100);
            return true;
          } else {
            stopAudioListening();
            speechToTextService.stopListening();
            textToSpeechService.stop();
            setUiState('idle');
            return false;
          }
        });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [startAudioListening, stopAudioListening]);

  return {
    isOpen,
    uiState,
    orbState,
    userQuery,
    assistantResponse,
    actionButtons,
    statusMessage,
    inputText,
    setInputText,
    levelRef,
    isRecording,
    permissionError,
    openAssistant,
    minimizeAssistant,
    closeAssistant,
    sendPrompt,
    toggleVoice
  };
}
