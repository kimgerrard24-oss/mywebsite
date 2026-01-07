// backend/src/notifications/notifications.repository.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class NotificationsRepository {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

// backend/src/notifications/notifications.repository.ts

async findMany(params: {
  userId: string;
  cursor: string | null;
  limit: number;
}) {
  const { userId, cursor, limit } = params;

  return this.prisma.notification.findMany({
    where: {
      userId,

      // ✅ BLOCK FILTER (authority)
      actor: {
        NOT: {
          OR: [
            {
              blockedBy: {
                some: { blockerId: userId },
              },
            },
            {
              blockedUsers: {
                some: { blockedId: userId },
              },
            },
          ],
        },
      },
    },

    include: {
      actor: {
        select: {
          id: true,
          displayName: true,
          avatarUrl: true,

          // ✅ snapshot for frontend UX (optional but recommended)
          blockedBy: {
            where: { blockerId: userId },
            select: { blockerId: true },
            take: 1,
          },
          blockedUsers: {
            where: { blockedId: userId },
            select: { blockedId: true },
            take: 1,
          },
        },
      },
    },

    orderBy: {
      createdAt: 'desc',
    },

    // ✅ important for cursor pagination
    take: limit + 1,

    ...(cursor
      ? {
          cursor: { id: cursor },
          skip: 1,
        }
      : {}),
  });
}


 findByIdForOwnerCheck(id: string) {
  return this.prisma.notification.findUnique({
    where: { id },
    select: { id: true, userId: true },
  });
}

  async markAsRead(params: {
    id: string;
    userId: string;
  }) {
    const { id, userId } = params;

    return this.prisma.notification.updateMany({
      where: {
        id,
        userId,
        isRead: false,
      },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });
  }

  // backend/src/notifications/notifications.repository.ts

async create(params: {
  userId: string;
  actorUserId: string;
  type: string;
  entityId: string;
  payload?: Prisma.InputJsonValue; 
}) {
  return this.prisma.notification.create({
    data: {
      userId: params.userId,
      actorUserId: params.actorUserId,
      type: params.type,
      entityId: params.entityId,

      /**
       * 🔹 Persist payload (JSON)
       * - ONLY when provided
       * - never pass null to Prisma Json field
       */
      ...(params.payload !== undefined
        ? { payload: params.payload }
        : {}),
    },

    include: {
      actor: {
        select: {
          id: true,
          displayName: true,
          avatarUrl: true,
        },
      },
    },
  });
}

}


