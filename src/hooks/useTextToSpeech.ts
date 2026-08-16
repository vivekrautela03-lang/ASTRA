import { useState, useEffect, useCallback } from 'react';
import { textToSpeechService, type VoiceSettings } from '../services/speech/tts';

export function useTextToSpeech() {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceSettings, setVoiceSettings] = useState<VoiceSettings>(textToSpeechService.getSettings());
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);

  useEffect(() => {
    textToSpeechService.setOnSpeakingStateChange((speaking) => {
      setIsSpeaking(speaking);
    });

    const voices = textToSpeechService.getAvailableVoices();
    setAvailableVoices(voices);
  }, []);

  const speak = useCallback((text: string, onEnd?: () => void) => {
    textToSpeechService.speak(text, onEnd);
  }, []);

  const stop = useCallback(() => {
    textToSpeechService.stop();
  }, []);

  const updateSettings = useCallback((newSettings: Partial<VoiceSettings>) => {
    textToSpeechService.updateSettings(newSettings);
    setVoiceSettings(textToSpeechService.getSettings());
  }, []);

  const testVoice = useCallback((sampleText?: string) => {
    textToSpeechService.testVoice(sampleText);
  }, []);

  return {
    isSpeaking,
    voiceSettings,
    availableVoices,
    speak,
    stop,
    updateSettings,
    testVoice
  };
}
