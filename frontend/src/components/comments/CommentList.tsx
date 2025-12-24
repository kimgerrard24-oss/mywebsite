// frontend/src/components/comments/CommentList.tsx

import { useEffect, useCallback } from "react";
import CommentItem from "./CommentItem";
import { usePostComments } from "@/hooks/usePostComments";

type Props = {
  postId: string;
};

export default function CommentList({ postId }: Props) {
  const {
    items,
    loading,
    error,
    hasMore,
    loadInitialComments,
    loadMoreComments,
    updateItem,
    removeItem,
  } = usePostComments({ postId });

  useEffect(() => {
    loadInitialComments();
  }, [loadInitialComments]);

  const handleUpdated = useCallback(
    (u: {
      id: string;
      content: string;
      editedAt?: string;
    }) => {
      updateItem(u.id, (prev) => ({
        ...prev,
        content: u.content,
        isEdited: true,
        editedAt: u.editedAt,
      }));
    },
    [updateItem],
  );

  const handleDeleted = useCallback(
    (commentId: string) => {
      removeItem(commentId);
    },
    [removeItem],
  );

  return (
    <section className="mt-3" aria-label="Post comments list">
      {items.map((c) => (
        <CommentItem
          key={c.id}
          comment={c}
          isEditable={c.isOwner}
          isDeletable={c.isOwner}
          onUpdated={handleUpdated}
          onDeleted={handleDeleted}
        />
      ))}

      {error && (
        <p className="mt-2 text-xs text-red-600">
          {error}
        </p>
      )}

      {hasMore && (
        <button
          type="button"
          onClick={loadMoreComments}
          disabled={loading}
          className="mt-2 text-xs text-blue-600 hover:underline disabled:opacity-50"
        >
          {loading ? "Loading..." : "Load more comments"}
        </button>
      )}
    </section>
  );
}
