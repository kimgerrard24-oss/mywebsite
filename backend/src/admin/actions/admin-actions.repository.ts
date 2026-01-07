import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { GetAdminActionsQueryDto } from './dto/get-admin-actions.query.dto';
import {
  ModerationActionType,
  ModerationTargetType,
} from '@prisma/client';
import { AdminActionsPolicy } from './policy/admin-actions.policy';

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
   * - Backward compatible with legacy actionType
   * - Backend remains authority
   */
  async canUnhideAction(
    action: {
      actionType: ModerationActionType | string;
      targetType: ModerationTargetType;
      targetId: string;
      createdAt: Date;
    },
  ): Promise<boolean> {
    /**
     * 1️⃣ Only reversible HIDE actions are eligible
     * - enum: HIDE
     * - legacy: HIDE_*
     */
    if (
      !AdminActionsPolicy.isReversibleHideAction(
        action,
      )
    ) {
      return false;
    }

    /**
     * 2️⃣ UNHIDE supported only for POST / COMMENT
     */
    if (
      action.targetType !== ModerationTargetType.POST &&
      action.targetType !==
        ModerationTargetType.COMMENT
    ) {
      return false;
    }

    /**
     * 3️⃣ Check current hidden state (source of truth)
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
     * - must support legacy UNHIDE_*
     */
    const newerActions =
      await this.prisma.moderationAction.findFirst(
        {
          where: {
            targetType: action.targetType,
            targetId: action.targetId,
            createdAt: {
              gt: action.createdAt,
            },
          },
          select: { actionType: true },
          orderBy: { createdAt: 'asc' },
        },
      );

    if (
      newerActions &&
      AdminActionsPolicy.isUnhideAction(
        newerActions,
      )
    ) {
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
