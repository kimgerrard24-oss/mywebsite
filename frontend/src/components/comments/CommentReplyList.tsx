// frontend/src/components/comments/CommentReplyList.tsx
import { useEffect, useCallback } from "react";
import CommentItem from "./CommentItem";
import { useCommentReplies } from "@/hooks/useCommentReplies";

type Props = {
  parentCommentId: string;
};

export default function CommentReplyList({
  parentCommentId,
}: Props) {
  const {
    items,
    loadInitialReplies,
    loadMoreReplies,
    hasMore,
    loading,
    error,
    updateItem,
    removeItem,
  } = useCommentReplies({ parentCommentId });

  useEffect(() => {
    loadInitialReplies();
  }, [loadInitialReplies]);

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
    <section
      className="mt-2 pl-4 border-l"
      aria-label="Comment replies"
    >
      {items.map((reply) => (
        <CommentItem
          key={reply.id}
          comment={reply}
          isEditable={reply.isOwner}
          isDeletable={reply.isOwner}
          onUpdated={handleUpdated}
          onDeleted={handleDeleted}
        />
      ))}

      {error && (
        <p className="mt-1 text-xs text-red-600">
          {error}
        </p>
      )}

      {hasMore && (
        <button
          type="button"
          onClick={loadMoreReplies}
          disabled={loading}
          className="mt-1 text-xs text-blue-600 hover:underline disabled:opacity-50"
        >
          {loading ? "Loading..." : "Load more replies"}
        </button>
      )}
    </section>
  );
}
