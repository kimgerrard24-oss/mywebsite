// frontend/src/components/admin/AdminDeleteCommentModal.tsx

import { useState } from 'react';

type Props = {
  open: boolean;
  onClose: () => void;
  onConfirm: (reason?: string) => void;
  loading?: boolean;
};

export default function AdminDeleteCommentModal({
  open,
  onClose,
  onConfirm,
  loading,
}: Props) {
  const [reason, setReason] = useState('');

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
    >
      <div className="w-full max-w-md rounded-lg bg-white p-5 shadow-lg">
        <h2 className="text-lg font-semibold text-gray-900">
          Delete Comment
        </h2>

        <p className="mt-2 text-sm text-gray-600">
          This action will permanently hide this comment.
        </p>

        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Reason (optional)"
          rows={3}
          className="mt-3 w-full rounded border px-3 py-2 text-sm"
        />

        <div className="mt-4 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            disabled={loading}
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={() => onConfirm(reason || undefined)}
            className="rounded bg-red-600 px-4 py-2 text-sm text-white hover:bg-red-700 disabled:opacity-50"
            disabled={loading}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
