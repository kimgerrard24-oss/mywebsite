// frontend/src/components/chat/ChatTypingIndicator.tsx
type Props = {
  typingUsers: {
    userId: string;
    displayName: string | null;
  }[];
};

export default function ChatTypingIndicator({
  typingUsers,
}: Props) {
  if (typingUsers.length === 0) return null;

  return (
    <div
      className="px-4 py-1 text-xs text-gray-500"
      aria-live="polite"
    >
      {typingUsers.length === 1
        ? `${typingUsers[0].displayName ?? 'User'} is typing…`
        : 'Someone is typing…'}
    </div>
  );
}
