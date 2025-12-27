// frontend/src/components/chat/ChatRoomList.tsx
import ChatRoomItem from './ChatRoomItem';

type Room = {
  id: string;
  peer: {
    id: string;
    displayName: string | null;
    avatarUrl: string | null;
  } | null;
  lastMessage: {
    content: string;
    createdAt: string;
  } | null;
  unreadCount: number;
};

type Props = {
  rooms: Room[];
};

export default function ChatRoomList({ rooms }: Props) {
  return (
    <ul
      className="divide-y"
      aria-label="Chat rooms list"
    >
      {rooms.map((room) => (
        <ChatRoomItem
          key={room.id}
          room={room}
        />
      ))}
    </ul>
  );
}
