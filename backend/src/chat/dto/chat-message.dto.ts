// backend/src/chat/dto/chat-message.dto.ts

import { buildCdnUrl } from '../../media/utils/build-cdn-url.util';

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
        id: row.sender?.id,
        displayName: row.sender?.displayName ?? null,
        avatarUrl: row.sender?.avatarUrl ?? null,
      },

      media: Array.isArray(row.media)
        ? row.media
            .filter((m: any) => m?.media?.objectKey)
            .map((m: any) => {
              const media = m.media;
              const mimeType: string = media.mimeType;

              const type: 'image' | 'audio' =
                mimeType.startsWith('audio/')
                  ? 'audio'
                  : 'image';

              return {
                id: media.id,
                type,
                url: buildCdnUrl(media.objectKey),
                mimeType,
                durationSec: media.duration ?? null,
              };
            })
        : [],
    };
  }
}
