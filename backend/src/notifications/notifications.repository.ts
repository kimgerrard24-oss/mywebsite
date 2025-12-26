// backend/src/notifications/notifications.repository.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class NotificationsRepository {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async findMany(params: {
    userId: string;
    cursor: string | null;
    limit: number;
  }) {
    const { userId, cursor, limit } = params;

    return this.prisma.notification.findMany({
      where: {
        userId,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
      ...(cursor
        ? {
            cursor: { id: cursor },
            skip: 1,
          }
        : {}),
    });
  }

   async findById(id: string) {
    return this.prisma.notification.findUnique({
      where: { id },
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
}
