// frontend/src/hooks/useSearchTags.ts

import { useCallback, useRef, useState } from "react";
import {
  searchTags,
  SearchTagItem,
} from "@/lib/api/search-tags";

export function useSearchTags() {
  const [items, setItems] = useState<SearchTagItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [nextCursor, setNextCursor] = useState<
    string | null
  >(null);

  const lastQueryRef = useRef<string | null>(null);

  const search = useCallback(async (q: string) => {
    const keyword = q.trim();

    if (!keyword) {
      setItems([]);
      setNextCursor(null);
      setError(null);
      return;
    }

    // ป้องกันยิง query ซ้ำ
    if (lastQueryRef.current === keyword) return;
    lastQueryRef.current = keyword;

    setLoading(true);
    setError(null);

    try {
      const res = await searchTags({ q: keyword });
      setItems(res.items);
      setNextCursor(res.nextCursor);
    } catch {
      setError("Unable to search tags at the moment");
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    items,
    loading,
    error,
    nextCursor,
    search,
  };
}
