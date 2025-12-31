// frontend/src/hooks/useCommentReplies.ts

import { useCallback, useEffect, useRef, useState } from "react";
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

  // 🔒 lifecycle safety
  const mountedRef = useRef(true);
  const loadingRef = useRef(false);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  // reset when parent changes
  useEffect(() => {
    setItems([]);
    setNextCursor(null);
    setInitialized(false);
    setError(null);
    loadingRef.current = false;
  }, [parentCommentId]);

  const loadInitialReplies = useCallback(async () => {
    if (loadingRef.current || initialized) return;

    loadingRef.current = true;
    setLoading(true);
    setError(null);

    try {
      const res = await getCommentReplies({
        parentCommentId,
      });

      if (!mountedRef.current) return;

      setItems(res.items);
      setNextCursor(res.nextCursor);
      setInitialized(true);
    } catch {
      if (!mountedRef.current) return;
      setError("Failed to load replies");
    } finally {
      if (!mountedRef.current) return;
      loadingRef.current = false;
      setLoading(false);
    }
  }, [parentCommentId, initialized]);

  const loadMoreReplies = useCallback(async () => {
    if (loadingRef.current || !nextCursor) return;

    loadingRef.current = true;
    setLoading(true);

    try {
      const res = await getCommentReplies({
        parentCommentId,
        cursor: nextCursor,
      });

      if (!mountedRef.current) return;

      setItems((prev) => [...prev, ...res.items]);
      setNextCursor(res.nextCursor);
    } finally {
      if (!mountedRef.current) return;
      loadingRef.current = false;
      setLoading(false);
    }
  }, [parentCommentId, nextCursor]);

  const submitReply = useCallback(
    async (content: string) => {
      if (loadingRef.current) return null;

      loadingRef.current = true;
      setLoading(true);
      setError(null);

      try {
        const reply = await createCommentReply(
          parentCommentId,
          { content },
        );

        if (!mountedRef.current) return null;

        setItems((prev) => [reply, ...prev]);
        return reply;
      } catch {
        if (!mountedRef.current) return null;
        setError("Unable to post reply");
        return null;
      } finally {
        if (!mountedRef.current) return null;
        loadingRef.current = false;
        setLoading(false);
      }
    },
    [parentCommentId],
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
