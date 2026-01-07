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

    const users = await this.prisma.user.findMany({
      where: {
        AND: [
          // ===== name match =====
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

          // ===== basic visibility =====
          { active: true },
          { isDisabled: false },
          { id: { not: requesterId } },

          // =========================
          // 🔒 BLOCK FILTER (2-WAY)
          // =========================

          // requester does NOT block this user
          {
            blockedBy: {
              none: {
                blockerId: requesterId,
              },
            },
          },

          // this user does NOT block requester
          {
            blockedUsers: {
              none: {
                blockedId: requesterId,
              },
            },
          },
        ],
      },

      // 🔒 hard limit กัน abuse / spam query
      take: Math.min(limit, 10),

      orderBy: { username: 'asc' },

      select: {
        id: true,
        username: true,
        displayName: true,
        avatarUrl: true,
      },
    });

    return users;
  }
}
