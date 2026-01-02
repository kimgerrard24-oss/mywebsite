// frontend/src/components/admin/DeletePostButton.tsx

import { useState } from "react";
import { useAdminDeletePost } from "@/hooks/useAdminDeletePost";
import DeletePostConfirmModal from "./DeletePostConfirmModal";

type Props = {
  /**
   * 🎯 target post id
   */
  postId: string;

  /**
   * 🛡 UI-level guard
   * (เช่น ไม่มีสิทธิ์, post protected, ฯลฯ)
   */
  disabled?: boolean;

  /**
   * 🔁 callback หลัง delete สำเร็จ
   * ให้ parent refresh data
   */
  onDeleted?: () => void;
};

export default function DeletePostButton({
  postId,
  disabled = false,
  onDeleted,
}: Props) {
  const [open, setOpen] = useState(false);

  const {
    deletePost,
    loading,
    error,
  } = useAdminDeletePost();

  /**
   * ==============================
   * Handlers
   * ==============================
   */

  async function handleConfirm(
    reason: string,
  ) {
    const ok = await deletePost(postId, reason);
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

      <DeletePostConfirmModal
        open={open}
        loading={loading}
        error={error}
        onConfirm={handleConfirm}
        onClose={() => setOpen(false)}
      />
    </>
  );
}
