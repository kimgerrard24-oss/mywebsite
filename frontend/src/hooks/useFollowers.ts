// frontend/src/hooks/useFollowers.ts

import { useCallback, useEffect, useState } from 'react';
import { getFollowers } from '@/lib/api/followers';
import type { Follower } from '@/types/follower';

type State = {
  items: Follower[];
  loading: boolean;
  error: string | null;
  nextCursor: string | null;
};

type Params = {
  userId: string;
  pageSize?: number;
};

export function useFollowers({
  userId,
  pageSize = 20,
}: Params) {
  const [state, setState] = useState<State>({
    items: [],
    loading: false,
    error: null,
    nextCursor: null,
  });

  const loadMore = useCallback(async () => {
    if (state.loading) return;

    setState((s) => ({ ...s, loading: true, error: null }));

    try {
      const res = await getFollowers({
        userId,
        cursor: state.nextCursor ?? undefined,
        limit: pageSize,
      });

      setState((s) => ({
        items: [...s.items, ...res.items],
        nextCursor: res.nextCursor,
        loading: false,
        error: null,
      }));
    } catch (err) {
      setState((s) => ({
        ...s,
        loading: false,
        error:
          err instanceof Error
            ? err.message
            : 'FETCH_FOLLOWERS_FAILED',
      }));
    }
  }, [userId, pageSize, state.loading, state.nextCursor]);

  // initial load
  useEffect(() => {
    setState({
      items: [],
      loading: false,
      error: null,
      nextCursor: null,
    });
    loadMore();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  return {
    items: state.items,
    loading: state.loading,
    error: state.error,
    hasMore: state.nextCursor !== null,
    loadMore,
  };
}
