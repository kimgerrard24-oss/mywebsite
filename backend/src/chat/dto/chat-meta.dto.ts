// backend/src/chat/dto/chat-meta.dto.ts
export class ChatMetaDto {
  id!: string;
  isGroup!: boolean;

  peer!: {
    id: string;
    displayName: string | null;
    avatarUrl: string | null;
  } | null;

  static fromChat(
    chat: any,
    options: { viewerUserId: string },
  ): ChatMetaDto {
    const peerParticipant = chat.participants.find(
      (p: any) => p.userId !== options.viewerUserId,
    );

    return {
      id: chat.id,
      isGroup: chat.isGroup,

      peer: peerParticipant
        ? {
            id: peerParticipant.user.id,
            displayName:
              peerParticipant.user.displayName,
            avatarUrl:
              peerParticipant.user.avatarUrl,
          }
        : null,
    };
  }
  
}
