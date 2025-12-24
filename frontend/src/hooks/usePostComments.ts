// frontend/src/hooks/usePostComments.ts

import { useCallback, useEffect, useState } from "react";
import {
  createPostComment,
  getPostComments,
} from "@/lib/api/comments";
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
  const [nextCursor, setNextCursor] =
    useState<string | null>(null);

  /**
   * 🔥 สำคัญมาก
   * ป้องกัน initial load ยิงซ้ำ
   */
  const [initialized, setInitialized] =
    useState(false);

  /**
   * =========================
   * Reset เมื่อ postId เปลี่ยน
   * =========================
   */
  useEffect(() => {
    setItems([]);
    setNextCursor(null);
    setInitialized(false);
    setError(null);
  }, [postId]);

  /**
   * =========================
   * Initial load (ยิงได้ครั้งเดียว)
   * =========================
   */
  const loadInitialComments = useCallback(async () => {
    if (loading || initialized) return;

    setLoading(true);
    setError(null);

    try {
      const res = await getPostComments({ postId });

      setItems(res.items);
      setNextCursor(res.nextCursor);
      setInitialized(true); // 🔥 mark ว่าโหลดแล้ว
    } catch {
      setError("Failed to load comments");
    } finally {
      setLoading(false);
    }
  }, [postId, loading, initialized]);

  /**
   * =========================
   * Load more (cursor-based)
   * =========================
   */
  const loadMoreComments = useCallback(async () => {
    if (loading || !nextCursor) return;

    setLoading(true);

    try {
      const res = await getPostComments({
        postId,
        cursor: nextCursor,
      });

      setItems((prev) => [
        ...prev,
        ...res.items,
      ]);
      setNextCursor(res.nextCursor);
    } catch {
      // fail-soft
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
    async (
      content: string,
    ): Promise<Comment | null> => {
      if (loading) return null;

      setLoading(true);
      setError(null);

      try {
        const comment = await createPostComment(
          postId,
          { content },
        );

        // optimistic update
        setItems((prev) => [comment, ...prev]);

        return comment;
      } catch {
        setError("Unable to post comment");
        return null;
      } finally {
        setLoading(false);
      }
    },
    [postId, loading],
  );

  /**
   * =========================
   * PUT /comments/:id (state sync)
   * =========================
   */
  const updateItem = useCallback(
    (
      commentId: string,
      updater: (prev: Comment) => Comment,
    ) => {
      setItems((prev) =>
        prev.map((c) =>
          c.id === commentId
            ? updater(c)
            : c,
        ),
      );
    },
    [],
  );

  /**
   * =========================
   * DELETE /comments/:id (state sync)
   * =========================
   */
  const removeItem = useCallback(
    (commentId: string) => {
      setItems((prev) =>
        prev.filter((c) => c.id !== commentId),
      );
    },
    [],
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

    // controlled mutators
    updateItem,
    removeItem,

    // shared
    loading,
    error,
  };
}
