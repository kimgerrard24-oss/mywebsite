// frontend/src/components/admin/AdminDeleteCommentButton.tsx

import { useState } from "react";
import { useAdminDeleteComment } from "@/hooks/useAdminDeleteComment";
import AdminDeleteCommentModal from "./AdminDeleteCommentModal";

type Props = {
  /**
   * 🎯 target comment id
   */
  commentId: string;

  /**
   * 🛡 UI-level guard
   * (เช่น ไม่มีสิทธิ์, comment protected, ฯลฯ)
   */
  disabled?: boolean;

  /**
   * 🔁 callback หลัง delete สำเร็จ
   * ให้ parent refresh data
   */
  onDeleted?: () => void;
};

export default function AdminDeleteCommentButton({
  commentId,
  disabled = false,
  onDeleted,
}: Props) {
  const [open, setOpen] = useState(false);

  const {
    deleteComment,
    loading,
    error,
  } = useAdminDeleteComment();

  /**
   * ==============================
   * Handlers
   * ==============================
   */

  async function handleConfirm(reason?: string) {
    const ok = await deleteComment({
      commentId,
      reason,
    });

    if (ok) {
      setOpen(false);
      onDeleted?.();
    }
  }

  /**
   * ==============================
   * Render
   * ==============================
   */

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        disabled={disabled || loading}
        aria-disabled={disabled || loading}
        className="text-sm text-red-600 hover:underline"
      >
        Delete
      </button>

      <AdminDeleteCommentModal
        open={open}
        loading={loading}
        onClose={() => setOpen(false)}
        onConfirm={handleConfirm}
      />
    </>
  );
}
