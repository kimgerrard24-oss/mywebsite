// backend/src/follows/follows.repository.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class FollowsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async createFollow(params: {
    followerId: string;
    followingId: string;
  }): Promise<void> {
    const { followerId, followingId } = params;

    await this.prisma.follow.create({
      data: {
        followerId,
        followingId,
      },
    });
  }

  async exists(params: {
    followerId: string;
    followingId: string;
  }): Promise<boolean> {
    const found = await this.prisma.follow.findUnique({
      where: {
        followerId_followingId: params,
      },
    });

    return !!found;
  }

  async deleteFollow(params: {
    followerId: string;
    followingId: string;
  }): Promise<void> {
    await this.prisma.follow.delete({
      where: {
        followerId_followingId: params,
      },
    });
  }

  // =====================================================
  // 🔒 BLOCK RELATION (2-way)
  // =====================================================
  async isBlockedBetween(params: {
    userA: string;
    userB: string;
  }): Promise<boolean> {
    const { userA, userB } = params;

    const blocked = await this.prisma.userBlock.findFirst({
      where: {
        OR: [
          { blockerId: userA, blockedId: userB },
          { blockerId: userB, blockedId: userA },
        ],
      },
      select: { blockerId: true },
    });

    return Boolean(blocked);
  }

  // =====================================================
  // Find followers (with block enforcement when viewer exists)
  // =====================================================
  async findFollowers(params: {
    userId: string;
    viewerUserId?: string | null; // ✅ NEW (optional)
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
        followingId: userId,

        // ===== BLOCK FILTER (only when viewer exists) =====
        ...(viewerUserId
          ? {
              follower: {
                AND: [
                  // viewer does NOT block follower
                  {
                    blockedBy: {
                      none: {
                        blockerId: viewerUserId,
                      },
                    },
                  },

                  // follower does NOT block viewer
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
            followerId: cursor,
            followingId: userId,
          },
        },
        skip: 1,
      }),

      orderBy: {
        createdAt: 'desc',
      },

      include: {
  follower: {
    select: {
      id: true,
      displayName: true,
      avatarMedia: {
        select: { objectKey: true },
      },

      // ✅ viewer blocked follower?
      blockedBy: viewerUserId
        ? {
            where: { blockerId: viewerUserId },
            select: { blockerId: true },
          }
        : false,

      // ✅ follower blocked viewer?
      blockedUsers: viewerUserId
        ? {
            where: { blockedId: viewerUserId },
            select: { blockedId: true },
          }
        : false,
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
  isFollowRequested: boolean;
  isBlockedByTarget: boolean;
  hasBlockedTarget: boolean;
} | null> {
  const { targetUserId, viewerUserId } = params;

  const viewerId = viewerUserId ?? '__none__'; // never match real id

  const user = await this.prisma.user.findUnique({
    where: { id: targetUserId },

    include: {
      // =========================
      // FOLLOW RELATION
      // =========================
      followers: {
        where: { followerId: viewerId },
        take: 1,
        select: { followerId: true },
      },

      // =========================
      // PENDING FOLLOW REQUEST
      // =========================
      followRequestsReceived: viewerUserId
        ? {
            where: { requesterId: viewerId },
            take: 1,
            select: { id: true },
          }
        : false,

      // =========================
      // BLOCK: target blocked viewer?
      // =========================
      blockedUsers: {
        where: { blockedId: viewerId },
        take: 1,
        select: { blockedId: true },
      },

      // =========================
      // BLOCK: viewer blocked target?
      // =========================
      blockedBy: {
        where: { blockerId: viewerId },
        take: 1,
        select: { blockerId: true },
      },
    },
  });

  if (!user) return null;

  const isSelf =
    viewerUserId !== null &&
    viewerUserId === user.id;

  return {
    // =========================
    // PRIVACY
    // =========================
    isPrivate: user.isPrivate,

    // =========================
    // SELF
    // =========================
    isSelf,

    // =========================
    // FOLLOW STATE
    // =========================
    isFollowing: user.followers.length > 0,

    // =========================
    // REQUEST STATE (NEW FLOW)
    // =========================
    isFollowRequested:
  Array.isArray(user.followRequestsReceived) &&
  user.followRequestsReceived.length > 0,


    // =========================
    // BLOCK STATE
    // =========================
    isBlockedByTarget: user.blockedUsers.length > 0,
    hasBlockedTarget: user.blockedBy.length > 0,
  };
}



async getTargetPrivacy(userId: string) {
  return this.prisma.user.findUnique({
    where: { id: userId },
    select: { isPrivate: true },
  });
}

}
