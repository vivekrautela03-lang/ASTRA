import { useState, useCallback } from 'react';
import { speechToTextService } from '../services/speech/stt';

export function useSpeechRecognition() {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');

  const startListening = useCallback((onResult: (text: string, isFinal: boolean) => void) => {
    speechToTextService.startListening((text, isFinal) => {
      setTranscript(text);
      onResult(text, isFinal);
    }, (listening) => {
      setIsListening(listening);
    });
  }, []);

  const stopListening = useCallback(() => {
    speechToTextService.stopListening();
    setIsListening(false);
  }, []);

  return {
    isAvailable: speechToTextService.isAvailable(),
    isListening,
    transcript,
    startListening,
    stopListening
  };
}
