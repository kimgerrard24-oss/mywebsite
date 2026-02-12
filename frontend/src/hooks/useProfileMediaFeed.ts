// frontend/src/hooks/useProfileMediaFeed.ts

import { useState, useCallback, useEffect, useRef } from "react";
import { getUserProfileMedia } from "@/lib/api/profile-media-feed";
import type { ProfileMediaItem } from "@/types/profile-media-feed";

type ProfileMediaType = "AVATAR" | "COVER";

export function useProfileMediaFeed(
  userId: string | undefined,
  type?: ProfileMediaType
) {
  const [items, setItems] = useState<ProfileMediaItem[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isMountedRef = useRef(true);

  // ===============================
  // Cleanup guard
  // ===============================
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // ===============================
  // Reset when user/type changes
  // ===============================
  useEffect(() => {
    if (!userId) return;

    setItems([]);
    setCursor(null);
    setHasMore(true);
    setError(null);
  }, [userId, type]);

  // ===============================
  // Load more (pagination)
  // ===============================
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
        type,
      });

      if (!isMountedRef.current) return;

      setItems((prev) => [...prev, ...res.items]);
      setCursor(res.nextCursor ?? null);
      setHasMore(Boolean(res.nextCursor));
    } catch (err: any) {
      if (!isMountedRef.current) return;

      const message =
        err?.response?.data?.message ||
        err?.message ||
        "โหลดรูปไม่สำเร็จ";

      setError(
        Array.isArray(message) ? message.join(", ") : message
      );
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  }, [userId, cursor, hasMore, loading, type]);

  // ===============================
  // Refresh (manual reload)
  // ===============================
  const refresh = useCallback(async () => {
    if (!userId) return;

    setItems([]);
    setCursor(null);
    setHasMore(true);
    setError(null);

    await loadMore();
  }, [userId, loadMore]);

  // ===============================
  // Auto load first page
  // ===============================
  useEffect(() => {
    if (!userId) return;

    // โหลดครั้งแรก
    if (items.length === 0 && hasMore && !loading) {
      void loadMore();
    }
  }, [userId, type]);

  return {
    items,
    loading,
    hasMore,
    error,

    isEmpty: !loading && items.length === 0,
    loadMore,
    refresh,
  };
}

