// backend/src/admin/moderation/follows/moderation-follows.repository.ts


import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import {
  ModerationActionType,
  ModerationTargetType,
} from '@prisma/client';

@Injectable()
export class ModerationFollowsRepository {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  // ======================================
  // Find follow by composite key
  // ======================================
  findFollow(params: {
    followerId: string;
    followingId: string;
  }) {
    return this.prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId: params.followerId,
          followingId: params.followingId,
        },
      },
      select: {
        followerId: true,
        followingId: true,
      },
    });
  }

  // ======================================
  // Delete follow (authority)
  // ======================================
  deleteFollow(params: {
    followerId: string;
    followingId: string;
  }) {
    return this.prisma.follow.delete({
      where: {
        followerId_followingId: {
          followerId: params.followerId,
          followingId: params.followingId,
        },
      },
    });
  }

  // ======================================
  // Create moderation action record
  // ======================================
  createModerationAction(params: {
    adminId: string;
    targetId: string; // composite follow id
    reason: string;
  }) {
    return this.prisma.moderationAction.create({
      data: {
        adminId: params.adminId,
        actionType: ModerationActionType.DELETE,
        targetType: ModerationTargetType.FOLLOW,
        targetId: params.targetId,
        reason: params.reason,
      },
    });
  }
}

