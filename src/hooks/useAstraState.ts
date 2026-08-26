import { useState, useCallback } from 'react';
import type { AstraOrbState } from '../components/astra/AstraOrb';

export function useAstraState(initialState: AstraOrbState = 'IDLE') {
  const [state, setState] = useState<AstraOrbState>(initialState);
  const [statusText, setStatusText] = useState<string>('ONLINE • READY');

  const setAstraState = useCallback((nextState: AstraOrbState, customStatus?: string) => {
    setState(nextState);

    if (customStatus) {
      setStatusText(customStatus);
      return;
    }

    const stateUpper = String(nextState).toUpperCase();
    switch (stateUpper) {
      case 'LISTENING':
        setStatusText('LISTENING...');
        break;
      case 'THINKING':
        setStatusText('THINKING...');
        break;
      case 'SPEAKING':
        setStatusText('SPEAKING...');
        break;
      case 'PROCESSING':
        setStatusText('PROCESSING...');
        break;
      case 'ERROR':
        setStatusText('ATTENTION REQUIRED');
        break;
      case 'IDLE':
      default:
        setStatusText('ONLINE • READY');
        break;
    }
  }, []);

  return {
    state,
    statusText,
    setAstraState
  };
}

export default useAstraState;
