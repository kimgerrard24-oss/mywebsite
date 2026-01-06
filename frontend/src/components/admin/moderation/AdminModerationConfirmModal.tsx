// frontend/src/components/admin/moderation/AdminModerationConfirmModal.tsx

type ModerationIntent =
  | "HIDE"
  | "UNHIDE"
  | "DANGER"; // future: DELETE / BAN

type Props = {
  open: boolean;

  /**
   * Action label shown to admin
   * e.g. "hide this post", "unhide this comment"
   */
  actionLabel: string;

  /**
   * Moderation intent
   * - HIDE / UNHIDE → reversible
   * - DANGER → destructive (future-proof)
   */
  intent?: ModerationIntent;

  /**
   * Confirm handler
   * - Must be async-safe
   * - Backend is authority
   */
  onConfirm: () => void;

  /**
   * Cancel / close modal
   */
  onCancel: () => void;

  /**
   * Optional loading state
   * (prevent double submit)
   */
  loading?: boolean;
};

export default function AdminModerationConfirmModal({
  open,
  actionLabel,
  intent = "HIDE",
  onConfirm,
  onCancel,
  loading = false,
}: Props) {
  if (!open) return null;

  const isDanger =
    intent === "DANGER";

  const confirmButtonClass = isDanger
    ? "bg-red-600 hover:bg-red-700"
    : intent === "UNHIDE"
    ? "bg-green-600 hover:bg-green-700"
    : "bg-orange-600 hover:bg-orange-700";

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
    >
      <div className="w-full max-w-sm rounded bg-white p-4 shadow-lg">
        {/* ===== Message ===== */}
        <p className="mb-4 text-sm text-gray-800">
          Are you sure you want to{" "}
          <strong>{actionLabel}</strong>?
        </p>

        {/* ===== Hint ===== */}
        {intent !== "UNHIDE" && (
          <p className="mb-4 text-xs text-gray-500">
            This action can be reviewed or reversed later
            by another moderation action.
          </p>
        )}

        {/* ===== Actions ===== */}
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="rounded border px-3 py-1 text-sm disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className={`rounded px-3 py-1 text-sm text-white disabled:opacity-60 ${confirmButtonClass}`}
          >
            {loading ? "Processing…" : "Confirm"}
          </button>
        </div>
      </div>
    </div>
  );
}
