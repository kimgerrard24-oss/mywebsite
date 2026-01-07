// backend/src/search/search-users.repository.ts

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SearchUsersRepository {
  constructor(private readonly prisma: PrismaService) {}

  async searchUsers(params: {
    q: string;
    limit: number;
    cursor?: string;
    viewerUserId?: string | null; // ✅ NEW (optional, backward compatible)
  }) {
    const { q, limit, cursor, viewerUserId } = params;

    const users = await this.prisma.user.findMany({
      where: {
        active: true,

        OR: [
          { username: { contains: q, mode: 'insensitive' } },
          { displayName: { contains: q, mode: 'insensitive' } },
        ],

        // ===== BLOCK FILTER (2-way, only when viewer exists) =====
        ...(viewerUserId
          ? {
              AND: [
                // viewer must NOT block target user
                {
                  blockedBy: {
                    none: {
                      blockerId: viewerUserId,
                    },
                  },
                },

                // target user must NOT block viewer
                {
                  blockedUsers: {
                    none: {
                      blockedId: viewerUserId,
                    },
                  },
                },
              ],
            }
          : {}),
      },

      orderBy: {
        username: 'asc',
      },

      take: limit + 1,

      ...(cursor && {
        skip: 1,
        cursor: { id: cursor },
      }),

      select: {
        id: true,
        username: true,
        displayName: true,
        avatarUrl: true,
      },
    });

    const hasNext = users.length > limit;
    const items = hasNext ? users.slice(0, limit) : users;

    return {
      items,
      nextCursor: hasNext ? items[items.length - 1].id : null,
    };
  }
}
