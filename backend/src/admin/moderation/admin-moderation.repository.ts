// backend/src/admin/moderation/admin-moderation.repository.ts

import {
  BadRequestException,
  Injectable,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  ModerationActionType,
  ModerationTargetType,
} from '@prisma/client';

@Injectable()
export class AdminModerationRepository {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async assertTargetExists(
    type: ModerationTargetType,
    id: string,
  ) {
    let exists = false;

    if (type === 'USER') {
      exists = !!(await this.prisma.user.findUnique({
        where: { id },
        select: { id: true },
      }));
    }

    if (type === 'POST') {
      exists = !!(await this.prisma.post.findUnique({
        where: { id },
        select: { id: true },
      }));
    }

    if (type === 'COMMENT') {
      exists = !!(await this.prisma.comment.findUnique({
        where: { id },
        select: { id: true },
      }));
    }

    if (!exists) {
      throw new BadRequestException(
        'Target not found',
      );
    }
  }

  async createModerationAction(params: {
    adminId: string;
    actionType: ModerationActionType;
    targetType: ModerationTargetType;
    targetId: string;
    reason: string;
  }) {
    return this.prisma.moderationAction.create({
      data: {
        adminId: params.adminId,
        actionType: params.actionType,
        targetType: params.targetType,
        targetId: params.targetId,
        reason: params.reason,
      },
    });
  }

  async applyActionEffect(
  targetType: ModerationTargetType,
  targetId: string,
  actionType: ModerationActionType,
) {
  if (
    targetType === ModerationTargetType.USER &&
    actionType === ModerationActionType.BAN_USER
  ) {
    await this.prisma.user.update({
      where: { id: targetId },
      data: { isDisabled: true },
    });
    return;
  }

  if (
    targetType === ModerationTargetType.POST &&
    actionType === ModerationActionType.HIDE
  ) {
    await this.prisma.post.update({
      where: { id: targetId },
      data: { isDeleted: true },
    });
    return;
  }

  if (
    targetType === ModerationTargetType.COMMENT &&
    actionType === ModerationActionType.HIDE
  ) {
    await this.prisma.comment.update({
      where: { id: targetId },
      data: { isDeleted: true },
    });
    return;
  }
}

}

