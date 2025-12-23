// frontend/src/hooks/usePostComments.ts

import { useCallback, useState } from "react";
import { createPostComment, getPostComments } from "@/lib/api/comments";
import type { Comment } from "@/types/comment";

type Params = {
  postId: string;
};

export function usePostComments({ postId }: Params) {
  /**
   * =========================
   * Shared state
   * =========================
   */
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * =========================
   * GET /posts/:id/comments
   * =========================
   */
  const [items, setItems] = useState<Comment[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);

  const loadInitialComments = useCallback(async () => {
    if (loading) return;

    setLoading(true);
    setError(null);

    try {
      const res = await getPostComments({ postId });
      setItems(res.items);
      setNextCursor(res.nextCursor);
    } catch {
      setError("Failed to load comments");
    } finally {
      setLoading(false);
    }
  }, [postId, loading]);

  const loadMoreComments = useCallback(async () => {
    if (loading || !nextCursor) return;

    setLoading(true);
    try {
      const res = await getPostComments({
        postId,
        cursor: nextCursor,
      });

      setItems((prev) => [...prev, ...res.items]);
      setNextCursor(res.nextCursor);
    } catch {
      // fail-soft: ไม่ throw
    } finally {
      setLoading(false);
    }
  }, [postId, nextCursor, loading]);

  /**
   * =========================
   * POST /posts/:id/comments
   * =========================
   */
  const submitComment = useCallback(
    async (content: string): Promise<Comment | null> => {
      if (loading) return null;

      setLoading(true);
      setError(null);

      try {
        const comment = await createPostComment(postId, { content });

        // ✅ optimistic แต่ปลอดภัย
        // backend เป็น authority อยู่แล้ว
        setItems((prev) => [comment, ...prev]);

        return comment;
      } catch {
        setError("Unable to post comment");
        return null;
      } finally {
        setLoading(false);
      }
    },
    [postId, loading]
  );

  /**
   * =========================
   * Public API
   * =========================
   */
  return {
    // POST
    submitComment,

    // GET
    items,
    loadInitialComments,
    loadMoreComments,
    hasMore: Boolean(nextCursor),

    // shared
    loading,
    error,
  };
}
