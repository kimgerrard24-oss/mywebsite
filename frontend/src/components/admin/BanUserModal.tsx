// frontend/src/components/admin/BanUserModal.tsx

import { FormEvent, useState } from "react";

type Props = {
  open: boolean;
  loading?: boolean;
  error?: string | null;
  onConfirm: (reason: string) => void;
  onClose: () => void;
};

export default function BanUserModal({
  open,
  loading,
  error,
  onConfirm,
  onClose,
}: Props) {
  const [reason, setReason] = useState("");

  if (!open) return null;

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    onConfirm(reason);
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
    >
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md rounded bg-white p-4 shadow"
      >
        <h2 className="mb-2 text-lg font-semibold">
          Ban user
        </h2>

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
          className="mt-1 w-full rounded border p-2 text-sm"
        />

        {error && (
          <p className="mt-2 text-sm text-red-600">
            {error}
          </p>
        )}

        <div className="mt-4 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded px-3 py-1 text-sm"
            disabled={loading}
          >
            Cancel
          </button>

          <button
            type="submit"
            className="rounded bg-red-600 px-3 py-1 text-sm text-white"
            disabled={loading}
          >
            {loading ? "Banning…" : "Ban user"}
          </button>
        </div>
      </form>
    </div>
  );
}
