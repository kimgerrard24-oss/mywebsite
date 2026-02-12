// backend/src/chat/dto/chat-room-display.dto.ts
import { buildCdnUrl } from '../../media/utils/build-cdn-url.util';

export class ChatRoomDisplayDto {
  id!: string;
  isGroup!: boolean;
  displayName!: string;
  displayAvatarUrl!: string | null;

  static fromRow(
    row: any,
    viewerUserId: string,
  ): ChatRoomDisplayDto {
    if (row.isGroup) {
      return {
        id: row.id,
        isGroup: true,
        displayName: row.title ?? 'Group chat',
        displayAvatarUrl: null,
      };
    }

    const peer = row.participants.find(
      (p: any) => p.userId !== viewerUserId,
    );

    return {
      id: row.id,
      isGroup: false,
      displayName:
        peer?.user?.displayName ?? 'User',
     displayAvatarUrl: peer?.user?.avatarMedia
  ? buildCdnUrl(peer.user.avatarMedia.objectKey)
  : null,

    };
  }
}
