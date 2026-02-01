// frontend/src/hooks/useMyHiddenTaggedPosts.ts

import { useState } from "react";
import type { PostFeedItem } from "@/types/post-feed";
import { getMyHiddenTaggedPosts, unhideTaggedPost } from "@/lib/api/hided-posts";

export function useMyHiddenTaggedPosts(initialData: {
  items: PostFeedItem[];
  nextCursor: string | null;
}) {
  const [items, setItems] = useState(initialData.items);
  const [cursor, setCursor] = useState<string | null>(
    initialData.nextCursor,
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const hasMore = Boolean(cursor);

  async function loadMore() {
  if (!cursor || loading) return;

  try {
    setLoading(true);
    const data = await getMyHiddenTaggedPosts(
      undefined,
      cursor,
    );

    setItems((prev) => [...prev, ...data.items]);
    setCursor(data.nextCursor ?? null); 
  } catch {
    setError("ไม่สามารถโหลดโพสต์เพิ่มเติมได้");
  } finally {
    setLoading(false);
  }
}

async function unhide(postId: string) {
  // optimistic remove
  setItems((prev) => prev.filter((p) => p.id !== postId));

  try {
    await unhideTaggedPost(postId);
  } catch {
    // rollback (reload safest)
    const data = await getMyHiddenTaggedPosts();
    setItems(data.items);
    setCursor(data.nextCursor ?? null); 
  }
}


  return {
    items,
    loading,
    error,
    hasMore,
    loadMore,
    unhide,
  };
}
