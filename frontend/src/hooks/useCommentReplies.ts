// frontend/src/hooks/useCommentReplies.ts

import { useCallback, useEffect, useState } from "react";
import {
  createCommentReply,
  getCommentReplies,
} from "@/lib/api/comment-replies";
import type { Comment } from "@/types/comment";

type Params = {
  parentCommentId: string;
};

export function useCommentReplies({
  parentCommentId,
}: Params) {
  const [items, setItems] = useState<Comment[]>([]);
  const [nextCursor, setNextCursor] =
    useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] =
    useState<string | null>(null);
  const [initialized, setInitialized] =
    useState(false);

  // reset when parent changes
  useEffect(() => {
    setItems([]);
    setNextCursor(null);
    setInitialized(false);
    setError(null);
  }, [parentCommentId]);

  const loadInitialReplies = useCallback(async () => {
    if (loading || initialized) return;

    setLoading(true);
    setError(null);

    try {
      const res = await getCommentReplies({
        parentCommentId,
      });

      setItems(res.items);
      setNextCursor(res.nextCursor);
      setInitialized(true);
    } catch {
      setError("Failed to load replies");
    } finally {
      setLoading(false);
    }
  }, [parentCommentId, loading, initialized]);

  const loadMoreReplies = useCallback(async () => {
    if (loading || !nextCursor) return;

    setLoading(true);

    try {
      const res = await getCommentReplies({
        parentCommentId,
        cursor: nextCursor,
      });

      setItems((prev) => [...prev, ...res.items]);
      setNextCursor(res.nextCursor);
    } finally {
      setLoading(false);
    }
  }, [parentCommentId, nextCursor, loading]);

  const submitReply = useCallback(
    async (content: string) => {
      if (loading) return null;

      setLoading(true);
      setError(null);

      try {
        const reply = await createCommentReply(
          parentCommentId,
          { content },
        );

        // 🔔 backend is source of truth
        setItems((prev) => [reply, ...prev]);
        return reply;
      } catch {
        setError("Unable to post reply");
        return null;
      } finally {
        setLoading(false);
      }
    },
    [parentCommentId, loading],
  );

  const updateItem = useCallback(
    (
      commentId: string,
      updater: (prev: Comment) => Comment,
    ) => {
      setItems((prev) =>
        prev.map((c) =>
          c.id === commentId ? updater(c) : c,
        ),
      );
    },
    [],
  );

  const removeItem = useCallback(
    (commentId: string) => {
      setItems((prev) =>
        prev.filter((c) => c.id !== commentId),
      );
    },
    [],
  );

  return {
    items,
    loadInitialReplies,
    loadMoreReplies,
    hasMore: Boolean(nextCursor),

    submitReply,
    updateItem,
    removeItem,

    loading,
    error,
  };
}
