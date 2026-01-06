// backend/src/admin/actions/admin-actions.repository.ts

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { GetAdminActionsQueryDto } from './dto/get-admin-actions.query.dto';
import {
  Prisma,
  ModerationActionType,
  ModerationTargetType,
} from '@prisma/client';

@Injectable()
export class AdminActionsRepository {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  /**
   * ==================================================
   * Existing methods (UNCHANGED)
   * ==================================================
   */

  async findActions(
    query: GetAdminActionsQueryDto,
  ) {
    const where: any = {};

    if (query.actionType) {
      where.actionType = query.actionType;
    }

    if (query.targetType) {
      where.targetType = query.targetType;
    }

    const [items, total] =
      await this.prisma.$transaction([
        this.prisma.moderationAction.findMany({
          where,
          orderBy: { createdAt: 'desc' },
          skip: (query.page - 1) * query.limit,
          take: query.limit,
          include: {
            admin: {
              select: {
                id: true,
                username: true,
                displayName: true,
              },
            },
          },
        }),
        this.prisma.moderationAction.count({
          where,
        }),
      ]);

    return { items, total };
  }

  async findById(id: string) {
    return this.prisma.moderationAction.findUnique({
      where: { id },
      select: {
        id: true,
        actionType: true,
        targetType: true,
        targetId: true,
        reason: true,
        createdAt: true,
        admin: {
          select: {
            id: true,
            username: true,
            displayName: true,
            role: true,
          },
        },
      },
    });
  }

  /**
   * ==================================================
   * UNHIDE authority data check
   * ==================================================
   *
   * - Read-only
   * - Uses Prisma enums (type-safe)
   * - Fail-safe by default
   */
  async canUnhideAction(
    action: {
      actionType: ModerationActionType;
      targetType: ModerationTargetType;
      targetId: string;
      createdAt: Date;
    },
  ): Promise<boolean> {
    /**
     * 1️⃣ Only HIDE actions are reversible
     */
    if (action.actionType !== ModerationActionType.HIDE) {
      return false;
    }

    /**
     * 2️⃣ UNHIDE is supported only for POST / COMMENT
     * - USER: use BAN_USER / UNBAN (no isHidden)
     * - CHAT_MESSAGE: no isHidden field
     */
    if (
      action.targetType !== ModerationTargetType.POST &&
      action.targetType !==
        ModerationTargetType.COMMENT
    ) {
      return false;
    }

    /**
     * 3️⃣ Check current hidden state
     */
    const isCurrentlyHidden =
      await this.isTargetCurrentlyHidden(
        action.targetType,
        action.targetId,
      );

    if (!isCurrentlyHidden) {
      return false;
    }

    /**
     * 4️⃣ Ensure no newer UNHIDE exists
     */
    const newerUnhide =
      await this.prisma.moderationAction.findFirst(
        {
          where: {
            targetType: action.targetType,
            targetId: action.targetId,
            actionType:
              ModerationActionType.UNHIDE,
            createdAt: {
              gt: action.createdAt,
            },
          },
          select: { id: true },
        },
      );

    if (newerUnhide) {
      return false;
    }

    return true;
  }

  /**
   * ==================================================
   * Internal helpers
   * ==================================================
   */

  private async isTargetCurrentlyHidden(
    targetType: ModerationTargetType,
    targetId: string,
  ): Promise<boolean> {
    switch (targetType) {
      case ModerationTargetType.POST: {
        const post =
          await this.prisma.post.findUnique({
            where: { id: targetId },
            select: {
              isHidden: true,
              isDeleted: true,
            },
          });

        return (
          !!post &&
          post.isHidden === true &&
          post.isDeleted !== true
        );
      }

      case ModerationTargetType.COMMENT: {
        const comment =
          await this.prisma.comment.findUnique(
            {
              where: { id: targetId },
              select: {
                isHidden: true,
                isDeleted: true,
              },
            },
          );

        return (
          !!comment &&
          comment.isHidden === true &&
          comment.isDeleted !== true
        );
      }

      default:
        return false;
    }
  }
}
