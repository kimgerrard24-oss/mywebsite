// backend/src/chat/dto/chat-message.dto.ts
export class ChatMessageDto {
  id!: string;
  content!: string;
  createdAt!: string;

  sender!: {
    id: string;
    displayName: string | null;
    avatarUrl: string | null;
  };

  static fromRow(row: any): ChatMessageDto {
    return {
      id: row.id,
      content: row.content,
      createdAt: row.createdAt.toISOString(),
      sender: {
        id: row.sender.id,
        displayName: row.sender.displayName,
        avatarUrl: row.sender.avatarUrl,
      },
    };
  }
}
