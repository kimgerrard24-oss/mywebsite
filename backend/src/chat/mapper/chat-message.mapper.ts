// backend/src/chat/mapper/chat-message.mapper.ts

export class ChatMessageMapper {
  static toEditedResponse(row: any) {
    return {
      id: row.id,
      chatId: row.chatId,
      content: row.content,
      isEdited: row.isEdited,
      isDeleted: true,
      deletedAt: row.deletedAt?.toISOString() ?? null,
      editedAt: row.editedAt?.toISOString() ?? null,
      updatedAt: row.updatedAt.toISOString(),
    };
  }
}
