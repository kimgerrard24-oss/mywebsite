// backend/src/chat/chat-message.repository.ts

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ChatMessageRepository {
  constructor(private readonly prisma: PrismaService) {}

  findMessageForEdit(params: {
    chatId: string;
    messageId: string;
  }) {
    const { chatId, messageId } = params;

    return this.prisma.chatMessage.findFirst({
      where: {
        id: messageId,
        chatId,
        isDeleted: false,
      },
      include: {
        sender: {
          select: {
            id: true,
            active: true,
            isDisabled: true,
          },
        },
      },
    });
  }

  updateMessage(params: {
    messageId: string;
    content: string;
  }) {
    const { messageId, content } = params;

    return this.prisma.chatMessage.update({
      where: { id: messageId },
      data: {
        content,
        isEdited: true,
        editedAt: new Date(),
      },
    });
  }

   findForDelete(params: {
    chatId: string;
    messageId: string;
  }) {
    const { chatId, messageId } = params;

    return this.prisma.chatMessage.findFirst({
      where: {
        id: messageId,
        chatId,
        isDeleted: false,
      },
      include: {
        sender: {
          select: {
            id: true,
            active: true,
            isDisabled: true,
          },
        },
      },
    });
  }

 softDelete(messageId: string) {
  return this.prisma.chatMessage.update({
    where: { id: messageId },
    data: {
      content: null,          
      isDeleted: true,
      deletedAt: new Date(),
    },
    include: {
      sender: {
        select: {
          id: true,
          displayName: true,
          avatarUrl: true,
        },
      },
      media: {
        include: {
          media: true,
        },
      },
    },
  });
}


  async findChatForRead(chatId: string) {
    return this.prisma.chat.findUnique({
      where: { id: chatId },
      select: {
        id: true,
        participants: {
          select: {
            userId: true,
            user: {
              select: {
                active: true,
                isDisabled: true,
              },
            },
          },
        },
      },
    });
  }

  /**
   * หา message ล่าสุด
   */
  async findLastMessage(chatId: string) {
  return this.prisma.chatMessage.findFirst({
    where: {
      chatId,
    },
    orderBy: { createdAt: 'desc' },
    select: { id: true },
  });
}


  /**
   * upsert read state
   */
  async upsertReadState(params: {
    chatId: string;
    userId: string;
    lastReadMessageId: string | null;
  }) {
    const { chatId, userId, lastReadMessageId } =
      params;

    return this.prisma.chatReadState.upsert({
      where: {
        chatId_userId: {
          chatId,
          userId,
        },
      },
      update: {
        lastReadMessageId,
        lastReadAt: new Date(),
      },
      create: {
        chatId,
        userId,
        lastReadMessageId,
        lastReadAt: new Date(),
      },
    });
  }
async findMessageById(params: {
  chatId: string;
  messageId: string;
}) {
  const { chatId, messageId } = params;

  return this.prisma.chatMessage.findFirst({
    where: {
      id: messageId,
      chatId,
    },
    include: {
      sender: {
        select: {
          id: true,
          displayName: true,
          avatarUrl: true,
        },
      },
      media: {
        include: {
          media: true,
        },
      },
    },
  });
}

/**
 * Attach media (image / audio) to chat message
 *
 * Assumptions (Production rules):
 * - media ownership & permission ถูก validate แล้วใน media upload/complete flow
 * - method นี้มีหน้าที่ "attach relation" เท่านั้น
 * - fail-soft: media ที่ใช้ไม่ได้จะถูก ignore
 */
async attachMediaToMessage(params: {
  messageId: string;
  mediaIds: string[];
}) {
  const { messageId, mediaIds } = params;

  // Guard: nothing to attach
  if (!Array.isArray(mediaIds) || mediaIds.length === 0) {
    return;
  }

  /**
   * 1) Filter usable media
   * - must exist
   * - must not be deleted
   * - must be allowed type for chat
   */
  const medias = await this.prisma.media.findMany({
    where: {
      id: { in: mediaIds },
      deletedAt: null,
      mediaType: {
        in: ['IMAGE', 'AUDIO'], // chat supports image + voice
      },
    },
    select: { id: true },
  });

  // Guard: no valid media
  if (medias.length === 0) {
    return;
  }

  /**
   * 2) Attach media → message (idempotent)
   * - skipDuplicates ป้องกัน insert ซ้ำ
   */
  await this.prisma.chatMessageMedia.createMany({
    data: medias.map((m) => ({
      messageId,
      mediaId: m.id,
    })),
    skipDuplicates: true,
  });
}


async findChatById(chatId: string) {
    return this.prisma.chat.findUnique({
      where: { id: chatId },
      include: {
        participants: {
          where: { leftAt: null },
          include: {
            user: {
              select: {
                id: true,
                active: true,
                isDisabled: true,
              },
            },
          },
        },
      },
    });
  }


}
