// backend/src/users/mention/mention.service.ts

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditService } from '../../auth/audit.service';
import { buildCdnUrl } from '../../media/utils/build-cdn-url.util';

@Injectable()
export class MentionService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

    async searchUsersForMention(params: {
    query: string;
    limit: number;
    requesterId: string;
  }) {
    const { query, limit, requesterId } = params;

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
          { active: true },
          { isDisabled: false },
          { id: { not: requesterId } },

          // 🔒 BLOCK FILTER (2-WAY)
          {
            blockedBy: {
              none: { blockerId: requesterId },
            },
          },
          {
            blockedUsers: {
              none: { blockedId: requesterId },
            },
          },
        ],
      },

      take: Math.min(limit, 10),
      orderBy: { username: 'asc' },

      select: {
        id: true,
        username: true,
        displayName: true,
        avatarMedia: {
  select: {
    objectKey: true,
  },
},

      },
    });

    // ==============================
    // ✅ AUDIT: MENTION USER SEARCH
    // ==============================
    try {
      await this.audit.createLog({
        userId: requesterId,
        action: 'mention.search_users',
        success: true,
        metadata: {
          q: query,
          requestedLimit: limit,
          actualLimit: Math.min(limit, 10),
          resultCount: users.length,
        },
      });
    } catch {
      // must not affect mention UX
    }

    return users.map((u) => ({
  id: u.id,
  username: u.username,
  displayName: u.displayName,
  avatarUrl: u.avatarMedia
    ? buildCdnUrl(u.avatarMedia.objectKey)
    : null,
}));

  }

}
