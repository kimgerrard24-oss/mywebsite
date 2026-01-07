// backend/src/search/search-tags.repository.ts

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SearchTagsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async searchTags(params: {
    q: string;
    limit: number;
    cursor?: string;
    viewerUserId?: string | null; // ✅ NEW
  }) {
    const { q, limit, cursor, viewerUserId } = params;

    const tags = await this.prisma.tag.findMany({
      where: {
        name: {
          contains: q,
          mode: 'insensitive',
        },

        // =========================
        // 🔒 BLOCK-AWARE TAG FILTER
        // tag ต้องมี post ที่ viewer มองเห็นได้อย่างน้อย 1 อัน
        // =========================
        ...(viewerUserId
          ? {
              posts: {
                some: {
                  post: {
                    isDeleted: false,
                    isHidden: false,
                    isPublished: true,

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
                  },
                },
              },
            }
          : {}),
      },

      orderBy: [
        { postCount: 'desc' }, // popularity first
        { name: 'asc' },
      ],

      take: limit + 1,

      ...(cursor && {
        skip: 1,
        cursor: { id: cursor },
      }),

      select: {
        id: true,
        name: true,
        postCount: true,
      },
    });

    const hasNext = tags.length > limit;
    const items = hasNext ? tags.slice(0, limit) : tags;

    return {
      items,
      nextCursor: hasNext ? items[items.length - 1].id : null,
    };
  }
}
