// frontend/src/hooks/useSearchUsers.ts

import { useCallback, useRef, useState } from 'react';
import {
  searchUsers,
  SearchUserItem,
} from '@/lib/api/search-users';

export function useSearchUsers() {
  const [items, setItems] = useState<SearchUserItem[]>(
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
      const keyword = q.trim();

      if (!keyword) {
        setItems([]);
        setNextCursor(null);
        setError(null);
        return;
      }

      // ป้องกันยิงซ้ำ query เดิม
      if (lastQueryRef.current === keyword) return;
      lastQueryRef.current = keyword;

      setLoading(true);
      setError(null);

      try {
        const res = await searchUsers({
          q: keyword,
        });

        setItems(res.items);
        setNextCursor(res.nextCursor);
      } catch {
        setError('Unable to search users at the moment');
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
