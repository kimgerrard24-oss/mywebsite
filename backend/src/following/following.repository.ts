// backend/src/following/following.repository.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class FollowingRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findFollowing(params: {
    userId: string;
    viewerUserId?: string | null; // ✅ viewer for block-aware UX
    cursor?: string;
    limit: number;
  }) {
    const {
      userId,
      viewerUserId,
      cursor,
      limit,
    } = params;

    return this.prisma.follow.findMany({
      where: {
        followerId: userId,

        // ===== BLOCK FILTER (2-way, enforcement) =====
        ...(viewerUserId
          ? {
              following: {
                AND: [
                  // viewer does NOT block following user
                  {
                    blockedBy: {
                      none: {
                        blockerId: viewerUserId,
                      },
                    },
                  },

                  // following user does NOT block viewer
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

      take: limit + 1,

      ...(cursor && {
        cursor: {
          followerId_followingId: {
            followerId: userId,
            followingId: cursor,
          },
        },
        skip: 1,
      }),

      orderBy: {
        createdAt: 'desc',
      },

      include: {
        following: {
          select: {
            id: true,
            displayName: true,
            avatarUrl: true,

            // ===== viewer-aware block state (UX only) =====
            ...(viewerUserId
              ? {
                  // viewer blocked this user?
                  blockedBy: {
                    where: { blockerId: viewerUserId },
                    select: { blockerId: true },
                  },

                  // this user blocked viewer?
                  blockedUsers: {
                    where: { blockedId: viewerUserId },
                    select: { blockedId: true },
                  },
                }
              : {}),
          },
        },
      },
    });
  }
}
