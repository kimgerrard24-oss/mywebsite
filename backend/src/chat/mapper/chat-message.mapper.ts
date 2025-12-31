// backend/src/chat/mapper/chat-message.mapper.ts

export class ChatMessageMapper {
  static toEditedResponse(row: any) {
    return {
      id: row.id,
      chatId: row.chatId,
      content: row.content ?? null,
      isEdited: row.isEdited,
      isDeleted: row.isDeleted,
      deletedAt: row.deletedAt?.toISOString() ?? null,
      editedAt: row.editedAt?.toISOString() ?? null,
      updatedAt: row.updatedAt.toISOString(),

      /**
       * media attachments (image / voice)
       * fail-soft: ถ้าไม่มี media ให้ส่ง []
       */
      media: Array.isArray(row.media)
        ? row.media.map((m: any) => ({
            id: m.media.id,
            type:
              m.media.mediaType === 'IMAGE'
                ? 'image'
                : 'audio',
            url: m.media.url,
            mimeType: m.media.mimeType,
            durationSec: m.media.durationSec ?? null,
          }))
        : [],
    };
  }
}
