// frontend/src/components/chat/ChatRoomEmptyState.tsx
export default function ChatRoomEmptyState() {
  return (
    <div
      className="flex flex-1 items-center justify-center text-gray-500"
      aria-label="No chats"
    >
      <p className="text-sm">
        You don’t have any chats yet.
      </p>
    </div>
  );
}
