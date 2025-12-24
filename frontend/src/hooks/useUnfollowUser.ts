// frontend/src/hooks/useUnfollowUser.ts

import { useCallback, useState } from 'react';
import { unfollowUser } from '@/lib/api/follows';
import type { UnfollowState } from '@/types/unfollow';

type Params = {
  userId: string;
  initialIsFollowing: boolean;
};

export function useUnfollowUser({
  userId,
  initialIsFollowing,
}: Params) {
  const [state, setState] = useState<UnfollowState>({
    isFollowing: initialIsFollowing,
    loading: false,
    error: null,
  });

  const unfollow = useCallback(async () => {
    if (state.loading || !state.isFollowing) return;

    setState((s) => ({ ...s, loading: true, error: null }));

    try {
      await unfollowUser(userId);

      // optimistic success
      setState({
        isFollowing: false,
        loading: false,
        error: null,
      });
    } catch (err) {
      setState((s) => ({
        ...s,
        loading: false,
        error:
          err instanceof Error
            ? err.message
            : 'UNFOLLOW_FAILED',
      }));
    }
  }, [userId, state.loading, state.isFollowing]);

  return {
    isFollowing: state.isFollowing,
    loading: state.loading,
    error: state.error,
    unfollow,
  };
}
