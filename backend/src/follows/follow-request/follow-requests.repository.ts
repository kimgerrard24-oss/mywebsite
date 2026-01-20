// backend/src/follows/follow-request/follow-requests.repository.ts

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import type {
  IncomingFollowRequestRow,
} from './dto/incoming-follow-request.dto';

@Injectable()
export class FollowRequestsRepository {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async exists(params: {
    requesterId: string;
    targetUserId: string;
  }): Promise<boolean> {
    const found =
      await this.prisma.followRequest.findUnique({
        where: {
          requesterId_targetUserId: params,
        },
      });
    return !!found;
  }

  async create(params: {
    requesterId: string;
    targetUserId: string;
  }) {
    return this.prisma.followRequest.create({
      data: params,
    });
  }

  async isBlockedBetween(params: {
    userA: string;
    userB: string;
  }): Promise<boolean> {
    const blocked =
      await this.prisma.userBlock.findFirst({
        where: {
          OR: [
            {
              blockerId: params.userA,
              blockedId: params.userB,
            },
            {
              blockerId: params.userB,
              blockedId: params.userA,
            },
          ],
        },
        select: { blockerId: true },
      });

    return Boolean(blocked);
  }

  async isFollowing(params: {
    followerId: string;
    followingId: string;
  }): Promise<boolean> {
    const found =
      await this.prisma.follow.findUnique({
        where: {
          followerId_followingId: params,
        },
      });
    return !!found;
  }

  findByRequesterAndTarget(params: {
    requesterId: string;
    targetUserId: string;
  }) {
    return this.prisma.followRequest.findUnique({
      where: {
        requesterId_targetUserId: {
          requesterId: params.requesterId,
          targetUserId: params.targetUserId,
        },
      },
    });
  }

  deleteById(id: string) {
    return this.prisma.followRequest.delete({
      where: { id },
    });
  }

  async findIncoming(params: {
    targetUserId: string;
    cursor?: string;
    limit: number;
  }): Promise<IncomingFollowRequestRow[]> {
    const { targetUserId, cursor, limit } = params;

    return this.prisma.followRequest.findMany({
      where: { targetUserId },
      orderBy: { createdAt: 'desc' },
      take: limit + 1,
      ...(cursor
        ? {
            cursor: { id: cursor },
            skip: 1,
          }
        : {}),
      include: {
        requester: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatarUrl: true,
          },
        },
      },
    });
  }

  async findByIdForApprove(requestId: string) {
  return this.prisma.followRequest.findUnique({
    where: { id: requestId },
    include: {
      requester: {
        select: { id: true },
      },
      target: {
        select: {
          id: true,
          isDisabled: true,
          isBanned: true,
          isAccountLocked: true,
        },
      },
    },
  });
}

 async findByIdForReject(id: string) {
    return this.prisma.followRequest.findUnique({
      where: { id },
      include: {
        target: {
          select: {
            id: true,
            isAccountLocked: true,
            isBanned: true,
            isDisabled: true,
          },
        },
      },
    });
  }

}
