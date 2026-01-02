// frontend/src/components/admin/DeletePostConfirmModal.tsx

import { FormEvent, useEffect, useState } from "react";

type Props = {
  /**
   * ควบคุมการเปิด / ปิด modal
   */
  open: boolean;

  /**
   * loading state จาก backend
   */
  loading?: boolean;

  /**
   * error message จาก backend (ถ้ามี)
   */
  error?: string | null;

  /**
   * confirm handler
   * reason จะถูกส่งไป backend
   */
  onConfirm: (reason: string) => void;

  /**
   * ปิด modal
   */
  onClose: () => void;
};

export default function DeletePostConfirmModal({
  open,
  loading = false,
  error,
  onConfirm,
  onClose,
}: Props) {
  const [reason, setReason] = useState("");

  /**
   * Reset state ทุกครั้งที่ modal เปิด
   * ป้องกัน reason ค้างจากครั้งก่อน
   */
  useEffect(() => {
    if (open) {
      setReason("");
    }
  }, [open]);

  if (!open) return null;

  function handleSubmit(e: FormEvent) {
    e.preventDefault();

    if (reason.trim().length === 0) {
      return;
    }

    onConfirm(reason.trim());
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-post-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
    >
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md rounded bg-white p-4 shadow"
      >
        {/* ===== Title ===== */}
        <h2
          id="delete-post-title"
          className="mb-2 text-lg font-semibold text-red-600"
        >
          Delete post
        </h2>

        {/* ===== Warning ===== */}
        <p className="mb-3 text-sm text-gray-600">
          This action will remove the post from public view.
          This action cannot be undone.
        </p>

        {/* ===== Reason ===== */}
        <label className="block text-sm font-medium">
          Reason
        </label>

        <textarea
          value={reason}
          onChange={(e) =>
            setReason(e.target.value)
          }
          rows={3}
          required
          disabled={loading}
          placeholder="Provide a reason for deleting this post"
          className="mt-1 w-full rounded border p-2 text-sm"
        />

        {/* ===== Error ===== */}
        {error && (
          <p className="mt-2 text-sm text-red-600">
            {error}
          </p>
        )}

        {/* ===== Actions ===== */}
        <div className="mt-4 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="rounded px-3 py-1 text-sm"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={loading}
            className="rounded bg-red-600 px-3 py-1 text-sm text-white"
          >
            {loading
              ? "Deleting…"
              : "Delete post"}
          </button>
        </div>
      </form>
    </div>
  );
}
