import { useState, useCallback } from 'react';
import { wakeWordEngine } from '../services/wakeWord/wakeWordEngine';

export function useWakeWord() {
  const [isWakeWordActive, setIsWakeWordActive] = useState(false);

  const startWakeWord = useCallback((onWakeWordDetected: () => void) => {
    setIsWakeWordActive(true);
    wakeWordEngine.startListening(() => {
      setIsWakeWordActive(false);
      onWakeWordDetected();
    });
  }, []);

  const stopWakeWord = useCallback(() => {
    setIsWakeWordActive(false);
    wakeWordEngine.stopListening();
  }, []);

  return {
    isAvailable: wakeWordEngine.isAvailable(),
    isWakeWordActive,
    startWakeWord,
    stopWakeWord
  };
}
