// frontend/src/components/chat/ChatConfirmDeleteModal.tsx

type Props = {
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

export default function ChatConfirmDeleteModal({
  open,
  onConfirm,
  onCancel,
}: Props) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="rounded-lg bg-white p-4 w-80">
        <h3 className="text-sm font-semibold mb-2">
          Delete message?
        </h3>
        <p className="text-xs text-gray-600 mb-4">
          This action cannot be undone.
        </p>

        <div className="flex justify-end gap-2">
          <button
            onClick={onCancel}
            className="text-xs px-3 py-1 rounded border"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="text-xs px-3 py-1 rounded bg-red-500 text-white"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
