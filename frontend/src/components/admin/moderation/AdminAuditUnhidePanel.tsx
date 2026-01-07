// frontend/src/components/admin/moderation/AdminAuditUnhidePanel.tsx

import { useState } from "react";
import { useCreateModerationAction } from "@/hooks/useCreateModerationAction";
import AdminModerationConfirmModal from "./AdminModerationConfirmModal";
import type { ModerationTargetType } from "@/types/moderation-action";

type Props = {
  /**
   * Target to be unhidden
   * (already validated by backend via canUnhide)
   */
  targetType: ModerationTargetType;
  targetId: string;
};

export default function AdminAuditUnhidePanel({
  targetType,
  targetId,
}: Props) {
  const { submit, loading, error } =
    useCreateModerationAction();

  const [openConfirm, setOpenConfirm] =
    useState(false);

  const [reason, setReason] =
    useState("");

  const [success, setSuccess] =
    useState(false);

  return (
    <section
      className="rounded border border-gray-200 bg-gray-50 p-4"
      aria-label="Unhide moderation action"
    >
      <h4 className="mb-2 text-sm font-medium">
        Revert moderation
      </h4>

      {/* ===== Reason ===== */}
      <div className="mb-3">
        <label
          htmlFor="unhide-reason"
          className="block text-sm font-medium"
        >
          Reason
        </label>

        <textarea
          id="unhide-reason"
          rows={3}
          className="mt-1 w-full rounded border px-2 py-1 text-sm"
          value={reason}
          disabled={loading || success}
          required
          onChange={(e) =>
            setReason(e.target.value)
          }
        />

        <p className="mt-1 text-xs text-gray-500">
          This reason will be recorded in the
          moderation audit log.
        </p>
      </div>

      {/* ===== Action ===== */}
      <button
        type="button"
        disabled={
          loading ||
          success ||
          !reason.trim()
        }
        onClick={() => setOpenConfirm(true)}
        className="rounded bg-green-600 px-4 py-2 text-sm text-white disabled:opacity-60"
      >
        Unhide content
      </button>

      {/* ===== Confirm ===== */}
      <AdminModerationConfirmModal
        open={openConfirm}
        actionLabel="unhide this content"
        onCancel={() =>
          setOpenConfirm(false)
        }
        onConfirm={async () => {
          if (loading || success) return;

          try {
            await submit({
              targetType,
              targetId,
              actionType: "UNHIDE",
              reason: reason.trim(),
            });

            // backend authority → reload to sync state
            setSuccess(true);
            window.location.reload();
          } finally {
            setOpenConfirm(false);
          }
        }}
      />

      {/* ===== Error ===== */}
      {error && !success && (
        <p className="mt-2 text-sm text-red-600">
          {error}
        </p>
      )}

      {/* ===== Success ===== */}
      {success && (
        <p className="mt-2 text-sm text-green-700">
          Content has been unhidden successfully.
        </p>
      )}
    </section>
  );
}

