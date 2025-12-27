// frontend/src/components/chat/ChatMessageActions.tsx

type Props = {
  onEdit?: () => void;
  onDelete?: () => void;
};

export default function ChatMessageActions({
  onEdit,
  onDelete,
}: Props) {
  return (
    <div className="absolute right-0 top-0 hidden gap-2 group-hover:flex">
      {onEdit && (
        <button
          onClick={onEdit}
          className="text-xs text-gray-400"
        >
          Edit
        </button>
      )}
      {onDelete && (
        <button
          onClick={onDelete}
          className="text-xs text-red-400"
        >
          Delete
        </button>
      )}
    </div>
  );
}
