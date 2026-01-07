// backend/src/chat/chat.repository.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ChatRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findDirectChat(
    userA: string,
    userB: string,
  ) {
    return this.prisma.chat.findFirst({
      where: {
        isGroup: false,
        participants: {
          every: {
            userId: { in: [userA, userB] },
          },
        },
      },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                displayName: true,
                avatarUrl: true,
              },
            },
          },
        },
      },
    });
  }

  async createDirectChat(
    userA: string,
    userB: string,
  ) {
    return this.prisma.chat.create({
      data: {
        isGroup: false,
        participants: {
          createMany: {
            data: [
              { userId: userA },
              { userId: userB },
            ],
          },
        },
      },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                displayName: true,
                avatarUrl: true,
              },
            },
          },
        },
      },
    });
  }

async findChatRoomsByUser(userId: string) {
  return this.prisma.chat.findMany({
    where: {
      // ✅ viewer must be participant
      participants: {
        some: {
          userId,
          leftAt: null,
        },
      },
      // ❗ block logic removed — enforced in ChatPermissionService
    },

    orderBy: {
      updatedAt: 'desc',
    },

    include: {
      participants: {
        where: {
          userId: { not: userId },
        },
        include: {
          user: {
            select: {
              id: true,
              displayName: true,
              avatarUrl: true,
            },
          },
        },
      },

      messages: {
        orderBy: {
          createdAt: 'desc',
        },
        take: 1,
      },

      readStates: {
        where: {
          userId,
        },
      },
    },
  });
}



  async findChatMeta(chatId: string) {
    return this.prisma.chat.findUnique({
      where: { id: chatId },
      include: {
        participants: {
          where: {
            leftAt: null,
          },
          include: {
            user: {
              select: {
                id: true,
                displayName: true,
                avatarUrl: true,
                active: true,
                isDisabled: true,
              },
            },
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

  async findMessages(params: {
    chatId: string;
    cursor: string | null;
    limit: number;
  }) {
    const { chatId, cursor, limit } = params;

    return this.prisma.chatMessage.findMany({
      where: {
        chatId,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit + 1,
      ...(cursor
        ? {
            cursor: { id: cursor },
            skip: 1,
          }
        : {}),
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

  async createMessage(params: {
    chatId: string;
    senderUserId: string;
    content: string | null;
  }) {
    const { chatId, senderUserId, content } = params;

    return this.prisma.chatMessage.create({
      data: {
        chatId,
        senderId: senderUserId,
        content,
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

  async findChatWithParticipants(chatId: string) {
    return this.prisma.chat.findUnique({
      where: { id: chatId },
      include: {
        participants: {
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

  async countUnreadMessages(params: {
    chatId: string;
    userId: string;
  }): Promise<number> {
    const { chatId, userId } = params;

    const readState =
      await this.prisma.chatReadState.findUnique({
        where: {
          chatId_userId: {
            chatId,
            userId,
          },
        },
        select: {
          lastReadAt: true,
        },
      });

    return this.prisma.chatMessage.count({
      where: {
        chatId,
        senderId: { not: userId },
        createdAt: readState?.lastReadAt
          ? { gt: readState.lastReadAt }
          : undefined,
        isDeleted: false,
      },
    });
  }

  async getChatOrFail(chatId: string) {
    const chat = await this.prisma.chat.findUnique({
      where: { id: chatId },
      include: {
        participants: {
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

    if (!chat) {
      throw new NotFoundException('Chat not found');
    }

    return chat;
  }

  async findMessageById(messageId: string) {
  return this.prisma.chatMessage.findUnique({
    where: { id: messageId },
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

}
