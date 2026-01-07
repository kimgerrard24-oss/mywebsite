// frontend/src/types/chat-room.ts

export type ChatPeer = {
  id: string;
  displayName: string | null;
  avatarUrl: string | null;

  isBlocked?: boolean;
  hasBlockedViewer?: boolean;
};

export type ChatRoomItem = {
  id: string;
  peer: ChatPeer | null;
  lastMessage: {
    content: string;
    createdAt: string;
  } | null;
  unreadCount: number;
};
