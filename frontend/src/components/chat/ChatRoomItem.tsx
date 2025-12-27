// frontend/src/components/chat/ChatRoomItem.tsx

import Link from 'next/link';
import ChatUnreadBadge from './ChatUnreadBadge';
import { useChatUnreadCount } from '@/hooks/useChatUnreadCount';

type Props = {
  room: {
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
};

export default function ChatRoomItem({ room }: Props) {
  const peer = room.peer;

  /**
   * ==============================
   * NEW: realtime unread count
   * - GET /chat/:chatId/unread-count
   * - backend = authority
   * - fail-soft fallback → room.unreadCount
   * ==============================
   */
  const { unreadCount: apiUnreadCount } =
    useChatUnreadCount(room.id);

  const unreadCount =
    typeof apiUnreadCount === 'number'
      ? apiUnreadCount
      : room.unreadCount;

  return (
    <li>
      <Link
        href={`/chat/${room.id}`}
        className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50"
      >
        <img
          src={
            peer?.avatarUrl ??
            '/avatar-placeholder.png'
          }
          alt=""
          className="h-10 w-10 rounded-full"
        />

        <div className="flex flex-1 flex-col overflow-hidden">
          <span className="truncate text-sm font-semibold">
            {peer?.displayName ?? 'User'}
          </span>

          <span className="truncate text-xs text-gray-500">
            {room.lastMessage?.content ??
              'No messages yet'}
          </span>
        </div>

        {/* =========================
            Unread Badge
            ========================= */}
        <ChatUnreadBadge count={unreadCount} />
      </Link>
    </li>
  );
}
