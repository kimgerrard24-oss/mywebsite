// frontend/src/hooks/useSearchPosts.ts

import { useCallback, useRef, useState } from 'react';
import {
  searchPosts,
  SearchPostItem,
} from '@/lib/api/search-posts';

export function useSearchPosts() {
  const [items, setItems] = useState<SearchPostItem[]>(
    [],
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(
    null,
  );
  const [nextCursor, setNextCursor] = useState<
    string | null
  >(null);

  const lastQueryRef = useRef<string | null>(null);

  const search = useCallback(
    async (q: string) => {
      if (!q.trim()) {
        setItems([]);
        setNextCursor(null);
        return;
      }

      // prevent duplicate query
      if (lastQueryRef.current === q) return;
      lastQueryRef.current = q;

      setLoading(true);
      setError(null);

      try {
        const res = await searchPosts({
          q,
        });

        setItems(res.items);
        setNextCursor(res.nextCursor);
      } catch (e) {
        setError('Failed to search posts');
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  return {
    items,
    loading,
    error,
    nextCursor,
    search,
  };
}
