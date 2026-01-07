// frontend/src/components/users/BlockUserButton.tsx

import { useState } from "react";
import { useBlockUser } from "@/hooks/useBlockUser";

type Props = {
  targetUserId: string;

  /**
   * optional: callback หลัง block สำเร็จ
   * เช่น refresh profile / redirect
   */
  onBlocked?: () => void;
};

export default function BlockUserButton({
  targetUserId,
  onBlocked,
}: Props) {
  const { submit, loading, error } =
    useBlockUser();

  const [confirming, setConfirming] =
    useState(false);

  async function handleConfirm() {
    const res = await submit(targetUserId);
    if (res.ok) {
      setConfirming(false);
      onBlocked?.();
    }
  }

  return (
    <section
      aria-label="Block user action"
      className="space-y-2"
    >
      {!confirming ? (
        <button
          type="button"
          onClick={() => setConfirming(true)}
          className="rounded-md border border-red-500 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50"
        >
          Block User
        </button>
      ) : (
        <div className="rounded-md border border-red-300 bg-red-50 p-3">
          <p className="text-sm text-red-700">
            Are you sure you want to block this
            user?
          </p>

          <div className="mt-2 flex gap-2">
            <button
              type="button"
              onClick={handleConfirm}
              disabled={loading}
              className="rounded bg-red-600 px-3 py-1.5 text-sm text-white hover:bg-red-700 disabled:opacity-50"
            >
              {loading ? "Blocking..." : "Confirm"}
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
