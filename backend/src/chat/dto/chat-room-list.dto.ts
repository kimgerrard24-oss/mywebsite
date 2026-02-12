// backend/src/chat/dto/chat-room-list.dto.ts
import { buildCdnUrl } from '../../media/utils/build-cdn-url.util';

export class ChatRoomListDto {
  id!: string;

  peer!: {
    id: string;
    displayName: string | null;
    avatarUrl: string | null;
  } | null;

  lastMessage!: {
    content: string;
    createdAt: string;
  } | null;

  unreadCount!: number;

  static fromRow(
    row: any,
    options: { viewerUserId: string },
  ): ChatRoomListDto {
    const peerParticipant = row.participants[0] ?? null;
    const lastMessage = row.messages[0] ?? null;
    const readState = row.readStates[0] ?? null;

    return {
      id: row.id,
      peer: peerParticipant
        ? {
            id: peerParticipant.user.id,
            displayName:
              peerParticipant.user.displayName,
            avatarUrl: peerParticipant.user.avatarMedia
  ? buildCdnUrl(peerParticipant.user.avatarMedia.objectKey)
  : null,

          }
        : null,

      lastMessage: lastMessage
        ? {
            content: lastMessage.content,
            createdAt:
              lastMessage.createdAt.toISOString(),
          }
        : null,

      unreadCount: readState?.lastReadAt
        ? 0 // คำนวณจริงใน unread-count route
        : 0,
    };
  }
}
