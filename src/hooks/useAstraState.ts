import { useState, useCallback, useRef } from 'react';
import type { AstraOrbState } from '../components/astra/AstraOrb';

export function useAstraState(initialState: AstraOrbState = 'IDLE') {
  const [state, setState] = useState<AstraOrbState>(initialState);
  const [statusText, setStatusText] = useState<string>('ONLINE • READY');
  const stateRef = useRef<AstraOrbState>(initialState);

  const setAstraState = useCallback((nextState: AstraOrbState, customStatus?: string) => {
    stateRef.current = nextState;
    setState(nextState);

    if (customStatus) {
      setStatusText(customStatus);
      return;
    }

    const stateUpper = String(nextState).toUpperCase();
    switch (stateUpper) {
      case 'WAKING':
        setStatusText('WAKING ASTRA...');
        break;
      case 'LISTENING':
        setStatusText('ASTRA IS LISTENING...');
        break;
      case 'THINKING':
        setStatusText('THINKING...');
        break;
      case 'SPEAKING':
        setStatusText('SPEAKING...');
        break;
      case 'PROCESSING':
        setStatusText('PROCESSING DIRECTIVE...');
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
    setAstraState,
    stateRef
  };
}

export default useAstraState;
