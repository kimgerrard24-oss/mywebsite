// frontend/src/hooks/useUsernameAvailability.ts

import { useEffect, useRef, useState } from 'react';
import {
  checkUsernameAvailable,
  type UsernameAvailableResult,
} from '@/lib/api/username';

type State =
  | { status: 'idle' }
  | { status: 'checking' }
  | { status: 'available' }
  | { status: 'unavailable'; reason?: string }
  | { status: 'error' };

export function useUsernameAvailability(
  username: string,
  delayMs = 400,
) {
  const [state, setState] = useState<State>({
    status: 'idle',
  });

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const requestIdRef = useRef(0);

  useEffect(() => {
    if (!username || username.length < 3) {
      setState({ status: 'idle' });
      return;
    }

    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    setState({ status: 'checking' });

    timerRef.current = setTimeout(async () => {
      const reqId = ++requestIdRef.current;

      try {
        const res = await checkUsernameAvailable(
          username,
        );

        if (reqId !== requestIdRef.current) return;

        if (res.available) {
          setState({ status: 'available' });
        } else {
          setState({
            status: 'unavailable',
            reason: res.reason,
          });
        }
      } catch {
        if (reqId !== requestIdRef.current) return;
        setState({ status: 'error' });
      }
    }, delayMs);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [username, delayMs]);

  return state;
}
