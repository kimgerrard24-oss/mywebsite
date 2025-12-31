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
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="chat-delete-title"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onCancel}
      />

      {/* Modal */}
      <div className="relative z-10 w-80 rounded-lg bg-white p-4">
        <h3
          id="chat-delete-title"
          className="mb-2 text-sm font-semibold"
        >
          This message will be deleted for everyone in this chat.
        </h3>

        <p className="mb-4 text-xs text-gray-600">
          This action cannot be undone.
        </p>

        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="rounded border px-3 py-1 text-xs"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={onConfirm}
            className="rounded bg-red-500 px-3 py-1 text-xs text-white"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
