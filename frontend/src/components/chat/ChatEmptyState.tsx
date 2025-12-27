// frontend/src/components/chat/ChatEmptyState.tsx
export default function ChatEmptyState() {
  return (
    <div
      className="flex flex-1 items-center justify-center text-gray-500"
      aria-label="No messages"
    >
      <p className="text-sm">
        No messages yet. Say hello 👋
      </p>
    </div>
  );
}
