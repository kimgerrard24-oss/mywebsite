// backend/src/users/mention/mention.service.ts

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class MentionService {
  constructor(private readonly prisma: PrismaService) {}

  async searchUsersForMention(params: {
    query: string;
    limit: number;
    requesterId: string;
  }) {
    const { query, limit, requesterId } = params;

    /**
     * NOTE:
     * - ไม่ search ด้วย email
     * - ไม่ return user ที่ถูกลบ
     * - ไม่ return ตัวเอง
     * - ใช้ case-insensitive search
     */
    const users = await this.prisma.user.findMany({
  where: {
    AND: [
      {
        OR: [
          {
            username: {
              contains: query,
              mode: 'insensitive',
            },
          },
          {
            displayName: {
              contains: query,
              mode: 'insensitive',
            },
          },
        ],
      },

      {
        active: true,
      },
      {
        isDisabled: false,
      },

      {
        id: {
          not: requesterId,
        },
      },
    ],
  },
  take: limit,
  orderBy: {
    username: 'asc',
  },
  select: {
    id: true,
    username: true,
    displayName: true,
    avatarUrl: true,
    },
  });
 }
}
