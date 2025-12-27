// backend/src/chat/dto/chat-room.dto.ts
export class ChatRoomDto {
  id!: string;
  isGroup!: boolean;
  participants!: {
    id: string;
    displayName: string | null;
    avatarUrl: string | null;
  }[];

  static fromEntity(
    chat: any,
    options: { viewerUserId: string },
  ): ChatRoomDto {
    return {
      id: chat.id,
      isGroup: chat.isGroup,
      participants: chat.participants
        .filter((p: any) => p.userId !== options.viewerUserId)
        .map((p: any) => ({
          id: p.user.id,
          displayName: p.user.displayName,
          avatarUrl: p.user.avatarUrl,
        })),
    };
  }
}
