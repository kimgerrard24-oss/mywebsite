// frontend/src/types/chat-message.ts
export type ChatMessage = {
  id: string;
  chatId: string;
  content: string;
  senderId: string;
  isEdited: boolean;
  editedAt: string | null;
  createdAt: string;
  deletedAt?: string | null;
  sender: {
    id?: string;
    displayName: string | null;
    avatarUrl: string | null;
  };
};
