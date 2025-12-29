// frontend/src/components/chat/ChatMessageActions.tsx

type Props = {
  onDelete?: () => void;
};

export default function ChatMessageActions({
  onDelete,
}: Props) {
  if (!onDelete) return null;

  return (
    <button
      type="button"
      onClick={onDelete}
      className="text-xs text-gray-400 hover:text-gray-600"
      aria-label="Message actions"
    >
      ...
    </button>
  );
}
