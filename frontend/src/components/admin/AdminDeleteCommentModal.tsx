// frontend/src/components/admin/AdminDeleteCommentModal.tsx

import { useEffect, useState } from "react";

type Props = {
  /**
   * ควบคุมการเปิด / ปิด modal
   */
  open: boolean;

  /**
   * ปิด modal
   */
  onClose: () => void;

  /**
   * confirm handler
   * reason เป็น optional
   */
  onConfirm: (reason?: string) => void;

  /**
   * loading state จาก backend
   */
  loading?: boolean;
};

export default function AdminDeleteCommentModal({
  open,
  onClose,
  onConfirm,
  loading = false,
}: Props) {
  const [reason, setReason] = useState("");

  /**
   * Reset state ทุกครั้งที่ modal เปิด
   * ป้องกัน reason ค้างจาก action ก่อนหน้า
   */
  useEffect(() => {
    if (open) {
      setReason("");
    }
  }, [open]);

  if (!open) return null;

  function handleConfirm() {
    const trimmed = reason.trim();
    onConfirm(trimmed.length > 0 ? trimmed : undefined);
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-comment-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
    >
      <div className="w-full max-w-md rounded-lg bg-white p-5 shadow-lg">
        {/* ===== Title ===== */}
        <h2
          id="delete-comment-title"
          className="text-lg font-semibold text-gray-900"
        >
          Delete comment
        </h2>

        {/* ===== Warning ===== */}
        <p className="mt-2 text-sm text-gray-600">
          This action will permanently hide this comment
          from public view.
        </p>

        {/* ===== Reason (optional) ===== */}
        <textarea
          value={reason}
          onChange={(e) =>
            setReason(e.target.value)
          }
          placeholder="Reason (optional)"
          rows={3}
          disabled={loading}
          className="mt-3 w-full rounded border px-3 py-2 text-sm"
        />

        {/* ===== Actions ===== */}
        <div className="mt-4 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="rounded px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleConfirm}
            disabled={loading}
            className="rounded bg-red-600 px-4 py-2 text-sm text-white hover:bg-red-700 disabled:opacity-50"
          >
            {loading ? "Deleting…" : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}
