// backend/src/chat/dto/chat-room.dto.ts

export class ChatRoomDto {
  id!: string;
  isGroup!: boolean;

  participants!: {
    id: string;
    displayName: string | null;
    avatarUrl: string | null;

    /**
     * 🔒 user block user flags (backend authority)
     */
    isBlockedByViewer: boolean;
    hasBlockedViewer: boolean;
  }[];

  static fromEntity(
    chat: any,
    options: { viewerUserId: string },
  ): ChatRoomDto {
    return {
      id: chat.id,
      isGroup: chat.isGroup,

      participants: chat.participants
        // one-to-one chat: hide self
        .filter((p: any) => p.userId !== options.viewerUserId)
        .map((p: any) => ({
          id: p.user.id,
          displayName: p.user.displayName,
          avatarUrl: p.user.avatarUrl,

          // ✅ must be computed earlier (query/service)
          isBlockedByViewer:
            p.user.isBlockedByViewer === true,

          hasBlockedViewer:
            p.user.hasBlockedViewer === true,
        })),
    };
  }
}
