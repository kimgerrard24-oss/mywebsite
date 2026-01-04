// frontend/src/hooks/useMentionSearch.ts

import { useEffect, useRef, useState } from 'react';
import { mentionSearch, MentionUser } from '@/lib/api/mention-search';

export function useMentionSearch(query: string | null) {
  const [items, setItems] = useState<MentionUser[]>([]);
  const [loading, setLoading] = useState(false);

  const abortRef = useRef<AbortController | null>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // 🔒 ออกจาก mention context
    if (query === null) {
      // cancel in-flight request
      if (abortRef.current) {
        abortRef.current.abort();
        abortRef.current = null;
      }

      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
        debounceRef.current = null;
      }

      setItems([]);
      setLoading(false);
      return;
    }

    const q = query.trim();

    // 🔒 พิมพ์แค่ @ → ไม่ต้องยิง API
    if (q.length === 0) {
      setItems([]);
      setLoading(false);
      return;
    }

    // debounce
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(async () => {
      // cancel previous request
      if (abortRef.current) {
        abortRef.current.abort();
      }

      const controller = new AbortController();
      abortRef.current = controller;

      try {
        setLoading(true);

        const res = await mentionSearch({
          q,
          limit: 10,
        });

        setItems(res.items);
      } catch (err: any) {
        if (err?.name === 'CanceledError') return;
        setItems([]);
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
        debounceRef.current = null;
      }
    };
  }, [query]);

  return {
    items,
    loading,
  };
}
