// backend/src/chat/mapper/chat-unread.mapper.ts
export function mapUnreadCount(count: number) {
  return {
    unreadCount: count,
  };
}
