// frontend/src/components/admin/moderation/AdminModerationConfirmModal.tsx

type Props = {
  open: boolean;
  actionLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
};

export default function AdminModerationConfirmModal({
  open,
  actionLabel,
  onConfirm,
  onCancel,
}: Props) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-sm rounded bg-white p-4">
        <p className="mb-4 text-sm">
          Are you sure you want to{" "}
          <strong>{actionLabel}</strong>?
        </p>

        <div className="flex justify-end gap-2">
          <button
            onClick={onCancel}
            className="rounded border px-3 py-1"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="rounded bg-red-600 px-3 py-1 text-white"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}
