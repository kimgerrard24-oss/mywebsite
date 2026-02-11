// frontend/src/hooks/useProfileMediaFeed.ts

import { useState, useCallback } from "react";
import { getUserProfileMedia } from "@/lib/api/profile-media-feed";
import type { ProfileMediaItem } from "@/types/profile-media-feed";

export function useProfileMediaFeed(userId: string) {
  const [items, setItems] = useState<ProfileMediaItem[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return;

    setLoading(true);
    setError(null);

    try {
      const res = await getUserProfileMedia({
        userId,
        cursor,
        limit: 20,
      });

      setItems((prev) => [...prev, ...res.items]);
      setCursor(res.nextCursor);
      setHasMore(Boolean(res.nextCursor));
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
        err?.message ||
        "โหลดรูปไม่สำเร็จ",
      );
    } finally {
      setLoading(false);
    }
  }, [userId, cursor, loading, hasMore]);

  return {
    items,
    loading,
    hasMore,
    error,
    loadMore,
  };
}

