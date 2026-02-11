// frontend/src/hooks/useProfileMediaFeed.ts

import { useState, useCallback, useEffect } from "react";
import { getUserProfileMedia } from "@/lib/api/profile-media-feed";
import type { ProfileMediaItem } from "@/types/profile-media-feed";

export function useProfileMediaFeed(userId: string | undefined) {
  const [items, setItems] = useState<ProfileMediaItem[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Reset feed when user changes
   */
  useEffect(() => {
    if (!userId) return;

    setItems([]);
    setCursor(null);
    setHasMore(true);
    setError(null);
  }, [userId]);

  const loadMore = useCallback(async () => {
    if (!userId) return;
    if (loading) return;
    if (!hasMore) return;

    setLoading(true);
    setError(null);

    try {
      const res = await getUserProfileMedia({
        userId,
        cursor,
        limit: 20,
      });

      setItems((prev) => [...prev, ...res.items]);
      setCursor(res.nextCursor ?? null);
      setHasMore(Boolean(res.nextCursor));
    } catch (err: any) {
      const message =
        typeof err?.response?.data?.message === "string"
          ? err.response.data.message
          : err?.message || "โหลดรูปไม่สำเร็จ";

      setError(message);
    } finally {
      setLoading(false);
    }
  }, [userId, cursor, hasMore, loading]);

  return {
    items,
    loading,
    hasMore,
    error,
    loadMore,
  };
}
