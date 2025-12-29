// backend/src/chat/dto/chat-message.dto.ts

export class ChatMessageDto {
  id!: string;
  content!: string | null;
  createdAt!: string;

  sender!: {
    id: string;
    displayName: string | null;
    avatarUrl: string | null;
  };

  /**
   * media attachments (image / voice)
   */
  media!: {
    id: string;
    type: 'image' | 'audio';
    url: string;
    mimeType: string;
    durationSec?: number | null;
  }[];

  static fromRow(row: any): ChatMessageDto {
    return {
      id: row.id,
      content: row.content ?? null,
      createdAt: row.createdAt.toISOString(),

      sender: {
        id: row.sender.id,
        displayName: row.sender.displayName,
        avatarUrl: row.sender.avatarUrl,
      },

      media: Array.isArray(row.media)
        ? row.media.map((m: any) => ({
            id: m.media.id,
            type: m.media.type,
            url: m.media.url,
            mimeType: m.media.mimeType,
            durationSec: m.media.durationSec ?? null,
          }))
        : [],
    };
  }
}
