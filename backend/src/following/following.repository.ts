// backend/src/following/following.repository.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class FollowingRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findFollowing(params: {
    userId: string;
    cursor?: string;
    limit: number;
  }) {
    const { userId, cursor, limit } = params;

    return this.prisma.follow.findMany({
      where: {
        followerId: userId,
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
          },
        },
      },
    });
  }
}
