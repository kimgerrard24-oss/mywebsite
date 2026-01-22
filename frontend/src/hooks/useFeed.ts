// frontend/src/hooks/useFeed.ts

import { useCallback, useEffect, useRef, useState } from "react";
import type { FeedResponse, PostFeedItem } from "@/types/post-feed";
import { fetchFeedClient } from "@/lib/api/feed";

export function useFeed(initial?: FeedResponse) {
  const [items, setItems] = useState<PostFeedItem[]>(
    initial?.items ?? []
  );
  const [nextCursor, setNextCursor] = useState<string | null>(
    initial?.nextCursor ?? null
  );
  const [loading, setLoading] = useState(false);
  const [ended, setEnded] = useState(
    initial ? initial.nextCursor === null : false
  );

  const loadingRef = useRef(false);

  const loadMore = useCallback(async () => {
    if (loadingRef.current || ended) return;

    loadingRef.current = true;
    setLoading(true);

    const res = await fetchFeedClient({
      cursor: nextCursor,
      limit: 20,
    });

    if (res && Array.isArray(res.items)) {
      setItems((prev) => [...prev, ...res.items]);
      setNextCursor(res.nextCursor);
      if (!res.nextCursor) setEnded(true);
    } else {
      setEnded(true);
    }

    loadingRef.current = false;
    setLoading(false);
  }, [nextCursor, ended]);

  return {
    items,
    loading,
    ended,
    loadMore,
  };
}
