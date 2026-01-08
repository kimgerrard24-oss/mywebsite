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

  /**
   * ===== Block flags (from backend authority) =====
   * optional → fail-soft if backend versionยังไม่ส่งมา
   */
  isBlocked?: boolean;        // viewer blocked peer
  hasBlockedViewer?: boolean; // peer blocked viewer
};

type Props = {
  rooms: Room[];
};

export default function ChatRoomList({ rooms }: Props) {
  /**
   * 🔒 HARD FILTER (Backend authority)
   * ถ้าฝั่งใดฝั่งหนึ่ง block → ไม่ต้องแสดงใน chat list
   */
  const visibleRooms = Array.isArray(rooms)
    ? rooms.filter(
        (room) =>
          room.isBlocked !== true &&
          room.hasBlockedViewer !== true,
      )
    : [];

  return (
    <ul
      className="divide-y"
      aria-label="Chat rooms list"
    >
      {visibleRooms.map((room) => (
        <ChatRoomItem
          key={room.id}
          room={room}
        />
      ))}
    </ul>
  );
}
