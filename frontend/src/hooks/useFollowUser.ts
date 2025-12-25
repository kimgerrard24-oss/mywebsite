// frontend/src/hooks/useFollowUser.ts

import { useCallback, useState } from 'react';
import { followUser } from '@/lib/api/follows';

export function useFollowUser(userId: string) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const follow = useCallback(async () => {
    if (loading) return;

    setLoading(true);
    setError(null);

    try {
      await followUser(userId);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'FOLLOW_FAILED',
      );
      throw err;
    } finally {
      setLoading(false);
    }
  }, [userId, loading]);

  return {
    follow,
    loading,
    error,
  };
}
