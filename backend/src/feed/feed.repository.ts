// backend/src/feed/feed.repository.ts

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class FeedRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findCandidatePosts(params: {
    limit: number;
    cursor?: string;
    viewerUserId: string | null;
    mediaType?: 'video';
  }) {
    const { limit, cursor, viewerUserId, mediaType } = params;

    return this.prisma.post.findMany({
      take: limit,
      ...(cursor && {
        skip: 1,
        cursor: { id: cursor },
      }),

      orderBy: { publishedAt: 'desc' },

      where: {
        isDeleted: false,
        isHidden: false,

        effectiveVisibility: 'PUBLIC',

        ...(mediaType === 'video'
          ? {
              media: {
                some: {
                  media: {
                    mediaType: 'VIDEO',
                  },
                },
              },
            }
          : {}),

        // ===== BLOCK ENFORCEMENT (2-way) =====
        ...(viewerUserId
          ? {
              AND: [
                {
                  author: {
                    blockedBy: {
                      none: { blockerId: viewerUserId },
                    },
                  },
                },
                {
                  author: {
                    blockedUsers: {
                      none: { blockedId: viewerUserId },
                    },
                  },
                },
              ],
            }
          : {}),
      },

      select: {
        id: true,
        content: true,
        publishedAt: true,
        likeCount: true,
        commentCount: true,

        author: {
  select: {
    id: true,
    displayName: true,
    avatarMedia: {
      select: { objectKey: true },
    },
    isPrivate: true,


            followers: viewerUserId
              ? {
                  where: { followerId: viewerUserId },
                  take: 1,
                }
              : false,

            followRequestsReceived: viewerUserId
              ? {
                  where: { requesterId: viewerUserId },
                  take: 1,
                }
              : false,

            blockedBy: viewerUserId
              ? {
                  where: { blockerId: viewerUserId },
                  take: 1,
                }
              : false,
          },
        },

        media: {
          select: {
            media: {
              select: {
                id: true,
                mediaType: true,
                objectKey: true,
                width: true,
                height: true,
                duration: true,
              },
            },
          },
        },
      },
    });
  }
}
