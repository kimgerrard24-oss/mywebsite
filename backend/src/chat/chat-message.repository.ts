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
        isDeleted: true,
        deletedAt: new Date(),
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
      isDeleted: false,
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
