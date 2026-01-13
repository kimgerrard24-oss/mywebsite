// frontend/src/hooks/useSecurityEvents.ts

import { useCallback, useEffect, useState } from "react";
import { fetchMySecurityEvents } from "@/lib/api/api-security";
import type { SecurityEvent } from "@/types/security-event";

export function useSecurityEvents(initial?: {
  items: SecurityEvent[];
  nextCursor: string | null;
}) {
  const [items, setItems] = useState<SecurityEvent[]>(
    initial?.items ?? [],
  );
  const [cursor, setCursor] = useState<string | null>(
    initial?.nextCursor ?? null,
  );
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(
    Boolean(initial?.nextCursor),
  );

  const loadMore = useCallback(async () => {
    if (!hasMore || loading) return;

    setLoading(true);
    try {
      const res = await fetchMySecurityEvents({
        cursor,
        limit: 20,
      });

      setItems((prev) => [...prev, ...res.items]);
      setCursor(res.nextCursor);
      setHasMore(Boolean(res.nextCursor));
    } finally {
      setLoading(false);
    }
  }, [cursor, hasMore, loading]);

  return {
    items,
    hasMore,
    loading,
    loadMore,
  };
}

