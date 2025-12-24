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

   async findFollowers(params: {
    userId: string;
    cursor?: string;
    limit: number;
  }) {
    const { userId, cursor, limit } = params;

    return this.prisma.follow.findMany({
      where: {
        followingId: userId,
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
            avatarUrl: true,
          },
        },
      },
    });
  }
}
