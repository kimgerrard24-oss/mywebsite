// frontend/src/hooks/useMentionSearch.ts

import { useEffect, useRef, useState } from 'react';
import { mentionSearch, MentionUser } from '@/lib/api/mention-search';

export function useMentionSearch(query: string | null) {
  const [items, setItems] = useState<MentionUser[]>([]);
  const [loading, setLoading] = useState(false);

  const abortRef = useRef<AbortController | null>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // ❌ ไม่อยู่ใน mention context → clear และออก
    if (query === null) {
      setItems([]);
      return;
    }

    // ✅ อยู่ใน mention context
    // - query === ""  → พิมพ์ @
    // - query === "to" → พิมพ์ @to
    const q = query.trim();

    // debounce
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(async () => {
      // cancel request เก่า
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
      }
    };
  }, [query]);

  return {
    items,
    loading,
  };
}
