// frontend/src/components/chat/ChatMessageActions.tsx

type Props = {
  onEdit?: () => void;
  onDelete?: () => void;
};

export default function ChatMessageActions({
  onEdit,
  onDelete,
}: Props) {
  if (!onEdit && !onDelete) return null;

  return (
    <div className="flex items-center gap-2">
      {onEdit && (
        <button
          type="button"
          onClick={onEdit}
          className="text-xs text-gray-400 hover:text-gray-600"
          aria-label="Edit message"
        >
          Edit
        </button>
      )}

      {onDelete && (
        <button
          type="button"
          onClick={onDelete}
          className="text-xs text-red-400 hover:text-red-600"
          aria-label="Delete message"
        >
          Delete
        </button>
      )}
    </div>
  );
}
