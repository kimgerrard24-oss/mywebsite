// frontend/src/components/comments/CommentList.tsx

import { useEffect, useCallback } from "react";
import CommentItem from "./CommentItem";
import CommentComposer from "./CommentComposer";
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

  /**
   * =========================
   * Initial load
   * =========================
   */
  useEffect(() => {
    loadInitialComments();
  }, [loadInitialComments]);

  /**
   * =========================
   * Sync after UPDATE (PUT)
   * =========================
   */
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

  /**
   * =========================
   * Sync after DELETE
   * =========================
   */
  const handleDeleted = useCallback(
    (commentId: string) => {
      removeItem(commentId);
    },
    [removeItem],
  );

  return (
    <section className="mt-3" aria-label="Post comments list">
      {/* =========================
          Create comment (POST)
         ========================= */}
      <CommentComposer
        postId={postId}
        onCreated={(comment) => {
          // เพิ่มคอมเมนต์ใหม่เข้า list แบบ controlled
          updateItem(comment.id, () => comment);
        }}
      />

      {/* =========================
          Comment items
         ========================= */}
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

      {/* =========================
          Error
         ========================= */}
      {error && (
        <p
          className="mt-2 text-xs text-red-600"
          role="alert"
        >
          {error}
        </p>
      )}

      {/* =========================
          Pagination
         ========================= */}
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

