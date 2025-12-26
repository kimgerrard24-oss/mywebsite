// frontend/src/hooks/useNotifications.ts
import { useCallback, useEffect, useState } from 'react';
import { getNotifications } from '@/lib/api/notifications';
import type { NotificationItem } from '@/types/notification';

type State = {
  items: NotificationItem[];
  loading: boolean;
  error: string | null;
  nextCursor: string | null;
};

export function useNotifications() {
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
      const res = await getNotifications({
        cursor: state.nextCursor,
        limit: 20,
      });

      setState((s) => ({
        items: [...s.items, ...res.items],
        loading: false,
        error: null,
        nextCursor: res.nextCursor,
      }));
    } catch {
      setState((s) => ({
        ...s,
        loading: false,
        error: 'Failed to load notifications',
      }));
    }
  }, [state.loading, state.nextCursor]);

  // initial load
  useEffect(() => {
    loadMore();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    ...state,
    loadMore,
    hasMore: Boolean(state.nextCursor),
  };
}
