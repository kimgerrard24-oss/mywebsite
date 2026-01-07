// frontend/src/components/users/UnblockUserButton.tsx

import { useState } from "react";
import { useUnblockUser } from "@/hooks/useUnblockUser";

type Props = {
  targetUserId: string;
  onUnblocked?: () => void;
};

export default function UnblockUserButton({
  targetUserId,
  onUnblocked,
}: Props) {
  const { submit, loading, error } =
    useUnblockUser();

  const [confirming, setConfirming] =
    useState(false);

  async function handleConfirm() {
    const res = await submit(targetUserId);
    if (res.ok) {
      setConfirming(false);
      onUnblocked?.();
    }
  }

  return (
    <section
      aria-label="Unblock user action"
      className="space-y-2"
    >
      {!confirming ? (
        <button
          type="button"
          onClick={() => setConfirming(true)}
          className="rounded-md border border-gray-400 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100"
        >
          Unblock User
        </button>
      ) : (
        <div className="rounded-md border border-gray-300 bg-gray-50 p-3">
          <p className="text-sm text-gray-800">
            Unblock this user?
          </p>

          <div className="mt-2 flex gap-2">
            <button
              type="button"
              onClick={handleConfirm}
              disabled={loading}
              className="rounded bg-gray-800 px-3 py-1.5 text-sm text-white hover:bg-gray-900 disabled:opacity-50"
            >
              {loading
                ? "Unblocking..."
                : "Confirm"}
            </button>

            <button
              type="button"
              onClick={() =>
                setConfirming(false)
              }
              className="rounded border px-3 py-1.5 text-sm"
            >
              Cancel
            </button>
          </div>

          {error && (
            <p className="mt-2 text-xs text-red-600">
              {error}
            </p>
          )}
        </div>
      )}
    </section>
  );
}
