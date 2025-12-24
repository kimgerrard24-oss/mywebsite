// frontend/src/hooks/useFollowUser.ts

import { useCallback, useState } from 'react';
import { followUser } from '@/lib/api/follows';
import type { FollowState } from '@/types/follow';

type Params = {
  userId: string;
  initialIsFollowing: boolean;
};

export function useFollowUser({
  userId,
  initialIsFollowing,
}: Params) {
  const [state, setState] = useState<FollowState>({
    isFollowing: initialIsFollowing,
    loading: false,
    error: null,
  });

  const follow = useCallback(async () => {
    if (state.loading || state.isFollowing) return;

    setState((s) => ({ ...s, loading: true, error: null }));

    try {
      await followUser(userId);

      // optimistic success
      setState({
        isFollowing: true,
        loading: false,
        error: null,
      });
    } catch (err) {
      setState((s) => ({
        ...s,
        loading: false,
        error: err instanceof Error ? err.message : 'FOLLOW_FAILED',
      }));
    }
  }, [userId, state.loading, state.isFollowing]);

  return {
    ...state,
    follow,
  };
}
