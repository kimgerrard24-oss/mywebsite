// frontend/src/components/chat/ChatRoomItem.tsx

import { useEffect, useState } from "react";
import Link from "next/link";
import ChatUnreadBadge from "./ChatUnreadBadge";
import { useChatUnreadCount } from "@/hooks/useChatUnreadCount";
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
   * Realtime unread count (backend authority)
   * ==============================
   */
  const { unreadCount: apiUnreadCount } =
    useChatUnreadCount(room.id);

  /**
   * ==============================
   * Local unread (fail-soft UI sync)
   * ==============================
   */
  const [localUnread, setLocalUnread] = useState<number>(
    typeof apiUnreadCount === "number"
      ? apiUnreadCount
      : room.unreadCount,
  );

  // sync when backend unread count changes
  useEffect(() => {
    if (typeof apiUnreadCount === "number") {
      setLocalUnread(apiUnreadCount);
    }
  }, [apiUnreadCount]);

  // listen for "chat:read" event (dispatched after markRead)
  useEffect(() => {
    function handleChatRead(e: Event) {
      const detail = (e as CustomEvent).detail;
      if (detail?.chatId === room.id) {
        setLocalUnread(0);
      }
    }

    window.addEventListener("chat:read", handleChatRead);
    return () => {
      window.removeEventListener("chat:read", handleChatRead);
    };
  }, [room.id]);

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

          <ChatUnreadBadge count={localUnread} />
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

          <ChatUnreadBadge count={localUnread} />
        </Link>
      )}
    </li>
  );
}
