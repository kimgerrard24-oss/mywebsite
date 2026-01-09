// frontend/src/components/admin/appeals/AdminResolveConfirmDialog.tsx

type Props = {
  decision: "APPROVED" | "REJECTED";
  onConfirm: () => void;
  onCancel: () => void;
};

export default function AdminResolveConfirmDialog({
  decision,
  onConfirm,
  onCancel,
}: Props) {
  return (
    <div className="rounded border bg-red-50 p-3 text-sm space-y-2">
      <p className="font-medium">
        Confirm {decision.toLowerCase()} appeal?
      </p>

      <div className="flex gap-2">
        <button
          onClick={onConfirm}
          className="rounded bg-red-600 px-3 py-1 text-white"
        >
          Confirm
        </button>

        <button
          onClick={onCancel}
          className="rounded border px-3 py-1"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
