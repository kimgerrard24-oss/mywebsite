// frontend/src/hooks/useUnfollowUser.ts

import { useCallback, useState } from 'react';
import { unfollowUser } from '@/lib/api/follows';

type Params = {
  userId: string;
};

export function useUnfollowUser({ userId }: Params) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const unfollow = useCallback(async () => {
    if (loading) return;

    setLoading(true);
    setError(null);

    try {
      await unfollowUser(userId);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'UNFOLLOW_FAILED',
      );
      throw err;
    } finally {
      setLoading(false);
    }
  }, [userId, loading]);

  return {
    unfollow,
    loading,
    error,
  };
}
