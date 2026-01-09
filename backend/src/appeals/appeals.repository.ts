// backend/src/appeals/appeals.repository.ts

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  AppealTargetType,
  ModerationTargetType,
  AppealStatus,
} from '@prisma/client';

@Injectable()
export class AppealsRepository {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  // ===== Ownership checks =====

  async isOwnerOfTarget(
    userId: string,
    type: AppealTargetType,
    targetId: string,
  ): Promise<boolean> {
    if (type === 'POST') {
      const post = await this.prisma.post.findUnique({
        where: { id: targetId },
        select: { authorId: true },
      });
      return post?.authorId === userId;
    }

    if (type === 'COMMENT') {
      const comment = await this.prisma.comment.findUnique({
        where: { id: targetId },
        select: { authorId: true },
      });
      return comment?.authorId === userId;
    }

    if (type === 'USER') {
      return targetId === userId;
    }

    if (type === 'CHAT_MESSAGE') {
      const msg = await this.prisma.chatMessage.findUnique({
        where: { id: targetId },
        select: { senderId: true },
      });
      return msg?.senderId === userId;
    }

    return false;
  }

  // ===== Must be moderated already =====

  async hasModerationAction(
    type: AppealTargetType,
    targetId: string,
  ): Promise<boolean> {
    const moderationType = type as unknown as ModerationTargetType;

    const count = await this.prisma.moderationAction.count({
      where: {
        targetType: moderationType,
        targetId,
      },
    });

    return count > 0;
  }

  // ===== Duplicate appeal =====

  async findExistingAppeal(
    userId: string,
    type: AppealTargetType,
    targetId: string,
  ) {
    return this.prisma.appeal.findUnique({
      where: {
        userId_targetType_targetId: {
          userId,
          targetType: type,
          targetId,
        },
      },
    });
  }

  // ===== Create =====

  async createAppeal(params: {
    userId: string;
    targetType: AppealTargetType;
    targetId: string;
    reason: string;
    detail?: string;
  }) {
    return this.prisma.appeal.create({
      data: {
        userId: params.userId,
        targetType: params.targetType,
        targetId: params.targetId,
        reason: params.reason,
        detail: params.detail,
      },
    });
  }

  // ===== Audit =====

  async createAuditLog(params: {
    userId: string;
    action: string;
    success: boolean;
    targetId: string;
    metadata?: Record<string, any>;
    ip?: string;
    userAgent?: string;
  }) {
    return this.prisma.auditLog.create({
      data: {
        userId: params.userId,
        action: params.action,
        success: params.success,
        targetId: params.targetId,
        metadata: params.metadata,
        ip: params.ip,
        userAgent: params.userAgent,
      },
    });
  }

   async findMyAppeals(params: {
    userId: string;
    cursor?: string;
    limit: number;
  }) {
    const { userId, cursor, limit } = params;

    return this.prisma.appeal.findMany({
      where: {
        userId,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit + 1,
      ...(cursor
        ? {
            skip: 1,
            cursor: { id: cursor },
          }
        : {}),
      select: {
        id: true,
        targetType: true,
        targetId: true,
        status: true,
        reason: true,
        createdAt: true,
        resolvedAt: true,
        resolutionNote: true,
      },
    });
  }

  async findMyAppealById(params: {
    userId: string;
    appealId: string;
  }): Promise<{
    id: string;
    targetType: string;
    targetId: string;
    status: string;
    reason: string;
    detail: string | null;
    createdAt: Date;
    resolvedAt: Date | null;
    resolutionNote: string | null;
  } | null> {
    const { userId, appealId } = params;

    return this.prisma.appeal.findFirst({
      where: {
        id: appealId,
        userId,
      },
      select: {
        id: true,
        targetType: true,
        targetId: true,
        status: true,
        reason: true,
        detail: true,
        createdAt: true,
        resolvedAt: true,
        resolutionNote: true,
      },
    });
  }

  async findByIdAndUser(params: {
    appealId: string;
    userId: string;
  }) {
    return this.prisma.appeal.findFirst({
      where: {
        id: params.appealId,
        userId: params.userId,
      },
      select: {
        id: true,
        status: true,
      },
    });
  }

  async withdrawAppeal(params: {
    appealId: string;
  }) {
    return this.prisma.appeal.update({
      where: { id: params.appealId },
      data: {
        status: AppealStatus.WITHDRAWN,
        withdrawnAt: new Date(),
      },
      select: {
        id: true,
        status: true,
        withdrawnAt: true,
      },
    });
  }
}

