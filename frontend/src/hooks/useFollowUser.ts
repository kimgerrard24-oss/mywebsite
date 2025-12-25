// frontend/src/hooks/useFollowUser.ts

import { useCallback, useRef, useState } from 'react';
import { followUser } from '@/lib/api/follows';

export function useFollowUser(userId: string) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ป้องกัน double request แบบ sync (hard guard)
  const inFlightRef = useRef(false);

  const follow = useCallback(async () => {
    if (inFlightRef.current) return;

    inFlightRef.current = true;
    setLoading(true);
    setError(null);

    try {
      await followUser(userId);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'FOLLOW_FAILED'
      );
      // fail-soft: ไม่ throw เพื่อไม่ disrupt UI flow
    } finally {
      inFlightRef.current = false;
      setLoading(false);
    }
  }, [userId]);

  return {
    follow,
    loading,
    error,
  };
}
