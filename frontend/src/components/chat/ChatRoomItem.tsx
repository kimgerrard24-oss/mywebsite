// frontend/src/components/chat/ChatRoomItem.tsx

import Link from 'next/link';
import ChatUnreadBadge from './ChatUnreadBadge';
import { useChatUnreadCount } from '@/hooks/useChatUnreadCount';
import type { ChatRoomItem as ChatRoom } from "@/types/chat-room";

type Props = {
  room: ChatRoom;
};

export default function ChatRoomItem({ room }: Props) {
  const peer = room.peer;

  const isBlocked =
  peer?.isBlocked === true ||
  peer?.hasBlockedViewer === true;

  function getInitial(name?: string | null) {
  if (!name) return "U";
  return name.trim().charAt(0).toUpperCase();
}



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
    {isBlocked ? (
      <div
        className="
          flex items-center gap-3 px-4 py-3
          opacity-60 cursor-not-allowed
        "
        aria-disabled="true"
      >
        <div
  className="
    h-10
    w-10
    rounded-full
    overflow-hidden
    bg-gray-200
    flex
    items-center
    justify-center
    flex-shrink-0
  "
  aria-hidden
>
  {peer?.avatarUrl ? (
    <img
      src={peer.avatarUrl}
      alt=""
      className="h-full w-full object-cover"
      referrerPolicy="no-referrer"
    />
  ) : (
    <span className="text-sm font-semibold text-gray-700">
      {getInitial(peer?.displayName)}
    </span>
  )}
</div>


        <div className="flex flex-1 flex-col overflow-hidden">
          <span className="truncate text-sm font-semibold">
            {peer?.displayName ?? "User"}
          </span>

          <span className="truncate text-xs text-gray-400">
            You can’t chat with this user
          </span>
        </div>

        <ChatUnreadBadge count={unreadCount} />
      </div>
    ) : (
      <Link
        href={`/chat/${room.id}`}
        className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50"
      >
        <div
  className="
    h-10
    w-10
    rounded-full
    overflow-hidden
    bg-gray-200
    flex
    items-center
    justify-center
    flex-shrink-0
  "
  aria-hidden
>
  {peer?.avatarUrl ? (
    <img
      src={peer.avatarUrl}
      alt=""
      className="h-full w-full object-cover"
      referrerPolicy="no-referrer"
    />
  ) : (
    <span className="text-sm font-semibold text-gray-700">
      {getInitial(peer?.displayName)}
    </span>
  )}
</div>


        <div className="flex flex-1 flex-col overflow-hidden">
          <span className="truncate text-sm font-semibold">
            {peer?.displayName ?? "User"}
          </span>

          <span className="truncate text-xs text-gray-500">
            {room.lastMessage?.content ?? "No messages yet"}
          </span>
        </div>

        <ChatUnreadBadge count={unreadCount} />
      </Link>
    )}
  </li>
);

}
