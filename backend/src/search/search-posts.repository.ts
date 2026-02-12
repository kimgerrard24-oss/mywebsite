// backend/src/search/search-posts.repository.ts

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SearchPostsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async searchPosts(params: {
    q: string;
    limit: number;
    cursor?: string;
    viewerUserId?: string | null; // ✅ NEW (optional)
  }) {
    const { q, limit, cursor, viewerUserId } = params;

    const posts = await this.prisma.post.findMany({
      where: {
        isDeleted: false,
        isHidden: false,
        isPublished: true,

        content: {
          contains: q,
          mode: 'insensitive',
        },

        // =========================
        // 🔒 BLOCK FILTER (2-way)
        // =========================
        ...(viewerUserId
          ? {
              author: {
                AND: [
                  // viewer does NOT block author
                  {
                    blockedBy: {
                      none: {
                        blockerId: viewerUserId,
                      },
                    },
                  },

                  // author does NOT block viewer
                  {
                    blockedUsers: {
                      none: {
                        blockedId: viewerUserId,
                      },
                    },
                  },
                ],
              },
            }
          : {}),
      },

      orderBy: {
        createdAt: 'desc',
      },

      take: limit + 1,

      ...(cursor && {
        skip: 1,
        cursor: { id: cursor },
      }),

      select: {
        id: true,
        content: true,
        createdAt: true,
        author: {
  select: {
    id: true,
    displayName: true,
    avatarMedia: {
      select: { objectKey: true },
    },
  },
},

      },
    });

    const hasNext = posts.length > limit;
    const items = hasNext ? posts.slice(0, limit) : posts;

    return {
      items,
      nextCursor: hasNext ? items[items.length - 1].id : null,
    };
  }
}
