// frontend/src/hooks/useIncomingFollowRequests.ts

'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  getIncomingFollowRequests,
  IncomingFollowRequest,
} from '@/lib/api/followRequests';

type State = {
  items: IncomingFollowRequest[];
  loading: boolean;
  error: string | null;
  nextCursor: string | null;
  hasMore: boolean;
};

export function useIncomingFollowRequests() {
  const [state, setState] = useState<State>({
    items: [],
    loading: false,
    error: null,
    nextCursor: null,
    hasMore: true,
  });

  const load = useCallback(async () => {
    if (state.loading || !state.hasMore)
      return;

    setState((s) => ({
      ...s,
      loading: true,
      error: null,
    }));

    try {
      const res =
        await getIncomingFollowRequests({
          cursor: state.nextCursor || undefined,
          limit: 20,
        });

      setState((s) => ({
        ...s,
        loading: false,
        items: [...s.items, ...res.items],
        nextCursor: res.nextCursor,
        hasMore: !!res.nextCursor,
      }));
    } catch (e: any) {
      setState((s) => ({
        ...s,
        loading: false,
        error:
          e?.message ??
          'GET_INCOMING_FOLLOW_REQUESTS_FAILED',
      }));
    }
  }, [state.loading, state.hasMore, state.nextCursor]);

  // initial load
  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    items: state.items,
    loading: state.loading,
    error: state.error,
    hasMore: state.hasMore,
    loadMore: load,
  };
}
