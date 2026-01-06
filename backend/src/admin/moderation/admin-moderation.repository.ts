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

  if (type === ModerationTargetType.USER) {
    exists = !!(await this.prisma.user.findUnique({
      where: { id },
      select: { id: true },
    }));
  }

  if (type === ModerationTargetType.POST) {
    exists = !!(await this.prisma.post.findUnique({
      where: { id },
      select: { id: true },
    }));
  }

  if (type === ModerationTargetType.COMMENT) {
    exists = !!(await this.prisma.comment.findUnique({
      where: { id },
      select: { id: true },
    }));
  }

  if (type === ModerationTargetType.CHAT_MESSAGE) {
    exists = !!(await this.prisma.chatMessage.findUnique({
      where: { id },
      select: { id: true },
    }));
  }

  if (!exists) {
    throw new BadRequestException('Target not found');
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
  // ===== USER =====
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

  // ===== POST =====
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

  // ===== COMMENT =====
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

  // ===== CHAT MESSAGE (NEW) =====
  if (
    targetType === ModerationTargetType.CHAT_MESSAGE &&
    actionType === ModerationActionType.HIDE
  ) {
    await this.prisma.chatMessage.update({
      where: { id: targetId },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
      },
    });
    return;
  }

  if (
    targetType === ModerationTargetType.CHAT_MESSAGE &&
    actionType === ModerationActionType.UNHIDE
  ) {
    await this.prisma.chatMessage.update({
      where: { id: targetId },
      data: {
        isDeleted: false,
        deletedAt: null,
      },
    });
    return;
  }
}


}

