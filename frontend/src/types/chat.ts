// frontend/src/types/chat.ts

export type ChatMeta = {
  id: string;
  isGroup: boolean;
  peer: {
    id: string;
    displayName: string | null;
    avatarUrl: string | null;
  } | null;

  // ✅ permission flags from backend
  isBlocked?: boolean;
  hasBlockedViewer?: boolean;
};
