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

  async getFollowVisibilityState(params: {
  targetUserId: string;
  viewerUserId: string | null;
}): Promise<{
  isPrivate: boolean;
  isSelf: boolean;
  isFollowing: boolean;
  isBlockedByTarget: boolean;
  hasBlockedTarget: boolean;
} | null> {
  const { targetUserId, viewerUserId } = params;

  // ============================
  // Case 1: viewer not logged in
  // ============================
  if (!viewerUserId) {
    const user = await this.prisma.user.findUnique({
      where: { id: targetUserId },
      select: {
        id: true,
        isPrivate: true,
      },
    });

    if (!user) return null;

    return {
      isPrivate: user.isPrivate,
      isSelf: false,
      isFollowing: false,
      isBlockedByTarget: false,
      hasBlockedTarget: false,
    };
  }

  // ============================
  // Case 2: viewer logged in
  // ============================
  const user = await this.prisma.user.findUnique({
    where: { id: targetUserId },
    include: {
      followers: {
        where: { followerId: viewerUserId },
        take: 1,
        select: { followerId: true },
      },

      blockedUsers: {
        where: { blockedId: viewerUserId },
        take: 1,
        select: { blockedId: true },
      },

      blockedBy: {
        where: { blockerId: viewerUserId },
        take: 1,
        select: { blockerId: true },
      },
    },
  });

  if (!user) return null;

  const isSelf = viewerUserId === user.id;

  return {
    isPrivate: user.isPrivate,
    isSelf,
    isFollowing: user.followers.length > 0,
    isBlockedByTarget: user.blockedUsers.length > 0,
    hasBlockedTarget: user.blockedBy.length > 0,
  };
}



}
