// frontend/src/types/chat-message.ts

export type ChatMessage = {
  id: string;
  chatId: string;

  /**
   * null when message contains only media
   */
  content: string | null;

  senderId?: string;

  isEdited: boolean;
  editedAt: string | null;
  deletedAt?: string | null;
  createdAt: string;

  sender: {
    id: string;
    displayName: string | null;
    avatarUrl: string | null;
    isBlocked?: boolean;        // viewer block author
    hasBlockedViewer?: boolean; // author block viewer
  };

  /**
   * media attachments (image / audio)
   */
  media: {
    id: string;
    type: 'image' | 'audio';
    url: string;
    mimeType: string;
    durationSec?: number | null;
  }[];
};
