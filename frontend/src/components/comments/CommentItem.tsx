// frontend/src/components/comments/CommentItem.tsx

import { useState } from "react";
import type { Comment } from "@/types/comment";
import { useUpdateComment } from "@/hooks/useUpdateComment";
import { useDeleteComment } from "@/hooks/useDeleteComment";

type Props = {
  comment: Comment;
  

  /**
   * ระบุจาก parent เท่านั้น
   * (เช่น viewer เป็นเจ้าของคอมเมนต์)
   */
  isEditable?: boolean;

  /**
   * ระบุจาก parent เท่านั้น
   * (เช่น viewer เป็นเจ้าของคอมเมนต์)
   */
  isDeletable?: boolean;

  /**
   * optional: ให้ parent sync state
   * โดยไม่บังคับ (fail-soft)
   */
  onUpdated?: (params: {
    id: string;
    content: string;
    editedAt?: string;
  }) => void;

  /**
   * optional: ให้ parent ลบ comment ออกจาก list
   */
  onDeleted?: (commentId: string) => void;
};

export default function CommentItem({
  comment,
  isEditable = false,
  isDeletable = false,
  onUpdated,
  onDeleted,
}: Props) {
  /**
   * =========================
   * Local UI state
   * =========================
   */
  const [editing, setEditing] = useState(false);
  const [content, setContent] = useState(comment.content);
  const [confirmingDelete, setConfirmingDelete] =
    useState(false);

  /**
   * =========================
   * Hooks
   * =========================
   */
  const {
    submit: submitUpdate,
    loading: updating,
    error: updateError,
  } = useUpdateComment();

  const {
    submit: submitDelete,
    loading: deleting,
    error: deleteError,
  } = useDeleteComment();

  /**
   * =========================
   * Save edited comment
   * =========================
   */
  async function handleSave() {
    const res = await submitUpdate({
      commentId: comment.id,
      content,
    });

    if (res) {
      setEditing(false);

      // 🔔 แจ้ง parent แบบ fail-soft
      onUpdated?.({
        id: comment.id,
        content: res.content,
        editedAt: res.editedAt,
      });
    }
  }

  /**
   * =========================
   * Delete comment
   * =========================
   */
  async function handleDelete() {
    const ok = await submitDelete(comment.id);

    if (ok) {
      onDeleted?.(comment.id); // 🔔 notify parent
    }
  }

  const loading = updating || deleting;
  const error = updateError || deleteError;

  return (
    <article
      className="py-2 text-sm"
      aria-label="Comment"
    >
     {/* ================= Author ================= */}
{comment.author && (
  <div className="mb-1 flex items-center gap-2">
    {comment.author.avatarUrl ? (
      <img
        src={comment.author.avatarUrl}
        alt={comment.author.displayName ?? "User"}
        className="h-6 w-6 rounded-full object-cover"
      />
    ) : (
      <div className="h-6 w-6 rounded-full bg-gray-300" />
    )}

    <span className="text-xs font-medium text-gray-800">
      {comment.author.displayName ?? "Unknown user"}
    </span>
  </div>
)}

      {/* ================= Content ================= */}
      {!editing ? (
        <p className="text-gray-900">
          {comment.content}
          {comment.isEdited && (
            <span className="ml-1 text-xs text-gray-400">
              (แก้ไขแล้ว)
            </span>
          )}
        </p>
      ) : (
        <textarea
          className="
            w-full
            resize-none
            rounded-md
            border
            px-2
            py-1
            text-sm
            focus:outline-none
            focus:ring
          "
          rows={2}
          value={content}
          disabled={loading}
          onChange={(e) => setContent(e.target.value)}
        />
      )}

      {/* ================= Meta ================= */}
      <time
        dateTime={comment.createdAt}
        className="mt-1 block text-xs text-gray-500"
      >
        {new Date(comment.createdAt).toLocaleString()}
      </time>

      {/* ================= Actions ================= */}
      {(isEditable || isDeletable) && (
        <div className="mt-1 flex gap-3 text-xs">
          {/* ===== Edit ===== */}
          {isEditable && (
            <>
              {!editing ? (
                <button
                  type="button"
                  onClick={() => setEditing(true)}
                  className="text-blue-600 hover:underline"
                >
                  แก้ไข
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={handleSave}
                    disabled={loading}
                    className="text-blue-600 hover:underline disabled:opacity-50"
                  >
                    บันทึก
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEditing(false);
                      setContent(comment.content);
                    }}
                    className="text-gray-500 hover:underline"
                  >
                    ยกเลิก
                  </button>
                </>
              )}
            </>
          )}

          {/* ===== Delete ===== */}
          {isDeletable && !editing && (
            <>
              {!confirmingDelete ? (
                <button
                  type="button"
                  onClick={() => setConfirmingDelete(true)}
                  className="text-red-600 hover:underline"
                >
                  ลบ
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={handleDelete}
                    disabled={loading}
                    className="text-red-600 hover:underline disabled:opacity-50"
                  >
                    ยืนยันลบ
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setConfirmingDelete(false)
                    }
                    className="text-gray-500 hover:underline"
                  >
                    ยกเลิก
                  </button>
                </>
              )}
            </>
          )}
        </div>
      )}

      {/* ================= Error ================= */}
      {error && (
        <p
          className="mt-1 text-xs text-red-600"
          role="alert"
        >
          {error}
        </p>
      )}
    </article>
  );
}
