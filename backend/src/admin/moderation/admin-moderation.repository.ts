// backend/src/admin/moderation/admin-moderation.repository.ts

import {
  BadRequestException,
  Injectable,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  ModerationActionType,
  ModerationTargetType,
  PostVisibility,
} from '@prisma/client';

@Injectable()
export class AdminModerationRepository {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  /**
   * ==================================================
   * Target existence check (UNCHANGED)
   * ==================================================
   */
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

    if (
      type ===
      ModerationTargetType.CHAT_MESSAGE
    ) {
      exists = !!(await this.prisma.chatMessage.findUnique(
        {
          where: { id },
          select: { id: true },
        },
      ));
    }

    if (!exists) {
      throw new BadRequestException(
        'Target not found',
      );
    }
  }

  /**
   * ==================================================
   * Create moderation action (UNCHANGED)
   * ==================================================
   */
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

  /**
   * ==================================================
   * Apply side-effect (FIXED)
   * ==================================================
   */
async applyActionEffect(
  targetType: ModerationTargetType,
  targetId: string,
  actionType: ModerationActionType,
) {
  /**
   * ==================================================
   * USER — BAN ONLY
   * ==================================================
   */
  if (
    targetType === ModerationTargetType.USER &&
    actionType === ModerationActionType.BAN_USER
  ) {
    await this.prisma.user.update({
      where: { id: targetId },
      data: {
        isDisabled: true,
        disabledAt: new Date(),
      },
    });
    return;
  }

  /**
   * ==================================================
   * POST
   * - HIDE / UNHIDE  → isHidden
   * - FORCE VISIBILITY → effectiveVisibility + overriddenByAdmin
   * ==================================================
   */
  if (targetType === ModerationTargetType.POST) {
    if (actionType === ModerationActionType.HIDE) {
      await this.prisma.post.update({
        where: { id: targetId },
        data: {
          isHidden: true,
          hiddenAt: new Date(),
        },
      });
      return;
    }

    if (actionType === ModerationActionType.UNHIDE) {
      await this.prisma.post.update({
        where: { id: targetId },
        data: {
          isHidden: false,
          hiddenAt: null,
        },
      });
      return;
    }

    // ✅ ADMIN FORCE VISIBILITY (NOT HIDE)
    if (
      actionType === ModerationActionType.POST_FORCE_PUBLIC
    ) {
      await this.prisma.post.update({
        where: { id: targetId },
        data: {
          effectiveVisibility: 'PUBLIC',
          overriddenByAdmin: true,
        },
      });
      return;
    }

    if (
      actionType === ModerationActionType.POST_FORCE_PRIVATE
    ) {
      await this.prisma.post.update({
        where: { id: targetId },
        data: {
          effectiveVisibility: 'PRIVATE',
          overriddenByAdmin: true,
        },
      });
      return;
    }

    return;
  }

  /**
   * ==================================================
   * COMMENT
   * - HIDE / UNHIDE
   * - sync post.commentCount
   * ==================================================
   */
  if (targetType === ModerationTargetType.COMMENT) {
    const comment =
      await this.prisma.comment.findUnique({
        where: { id: targetId },
        select: {
          id: true,
          postId: true,
          isHidden: true,
          isDeleted: true,
        },
      });

    if (!comment) return;

    if (
      actionType === ModerationActionType.HIDE &&
      comment.isHidden !== true &&
      comment.isDeleted !== true
    ) {
      await this.prisma.$transaction([
        this.prisma.comment.update({
          where: { id: targetId },
          data: {
            isHidden: true,
            hiddenAt: new Date(),
          },
        }),
        this.prisma.post.update({
          where: { id: comment.postId },
          data: {
            commentCount: { decrement: 1 },
          },
        }),
      ]);
      return;
    }

    if (
      actionType === ModerationActionType.UNHIDE &&
      comment.isHidden === true &&
      comment.isDeleted !== true
    ) {
      await this.prisma.$transaction([
        this.prisma.comment.update({
          where: { id: targetId },
          data: {
            isHidden: false,
            hiddenAt: null,
          },
        }),
        this.prisma.post.update({
          where: { id: comment.postId },
          data: {
            commentCount: { increment: 1 },
          },
        }),
      ]);
      return;
    }

    return;
  }

  /**
   * ==================================================
   * CHAT MESSAGE
   * - soft delete / restore
   * ==================================================
   */
  if (targetType === ModerationTargetType.CHAT_MESSAGE) {
    if (actionType === ModerationActionType.HIDE) {
      await this.prisma.chatMessage.update({
        where: { id: targetId },
        data: {
          isDeleted: true,
          deletedAt: new Date(),
        },
      });
      return;
    }

    if (actionType === ModerationActionType.UNHIDE) {
      await this.prisma.chatMessage.update({
        where: { id: targetId },
        data: {
          isDeleted: false,
          deletedAt: null,
        },
      });
      return;
    }

    return;
  }
}

  /**
   * ==================================================
   * Mark related report as ACTION_TAKEN (UNCHANGED)
   * ==================================================
   */
  async markReportActionTaken(params: {
    targetType: ModerationTargetType;
    targetId: string;
    adminId: string;
    reason: string;
  }) {
    const {
      targetType,
      targetId,
      adminId,
    } = params;

    await this.prisma.report.updateMany({
      where: {
        targetType: targetType as any, // enum compatible
        targetId,
        status: {
          in: ['PENDING', 'REVIEWED'],
        },
        withdrawnAt: null,
      },
      data: {
        status: 'ACTION_TAKEN',
        resolvedByAdminId: adminId,
        resolvedAt: new Date(),
      },
    });
  }

  /**
   * ==================================================
   * UNHIDE validation helper (USED BY SERVICE)
   * ==================================================
   */
  async canUnhideTarget(
    targetType: ModerationTargetType,
    targetId: string,
  ): Promise<boolean> {
    if (
      targetType ===
      ModerationTargetType.POST
    ) {
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

    if (
      targetType ===
      ModerationTargetType.COMMENT
    ) {
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

    // USER / CHAT_MESSAGE cannot be unhidden
    return false;
  }

  async resolveTargetOwnerUserId(
  targetType: ModerationTargetType,
  targetId: string,
): Promise<string | null> {

  if (targetType === ModerationTargetType.USER) {
    return targetId; // owner = user เอง
  }

  if (targetType === ModerationTargetType.POST) {
    const post = await this.prisma.post.findUnique({
      where: { id: targetId },
      select: { authorId: true },
    });
    return post?.authorId ?? null;
  }

  if (targetType === ModerationTargetType.COMMENT) {
    const comment = await this.prisma.comment.findUnique({
      where: { id: targetId },
      select: { authorId: true },
    });
    return comment?.authorId ?? null;
  }

  if (targetType === ModerationTargetType.CHAT_MESSAGE) {
    const msg = await this.prisma.chatMessage.findUnique({
      where: { id: targetId },
      select: { senderId: true },
    });
    return msg?.senderId ?? null;
  }

  return null;
}


async findPostForModeration(postId: string) {
    return this.prisma.post.findUnique({
      where: { id: postId },
      select: {
        id: true,
        isDeleted: true,
        isHidden: true,
        authorId: true,
      },
    });
  }

  async overrideVisibility(params: {
    postId: string;
    effectiveVisibility: PostVisibility;
    adminId: string;
    reason?: string;
  }) {
    return this.prisma.post.update({
      where: { id: params.postId },
      data: {
        effectiveVisibility: params.effectiveVisibility,
        hiddenByAdminId: params.adminId,
        hiddenReason: params.reason ?? null,
        hiddenAt: new Date(),
      },
    });
  }

  async canOverridePostVisibility(postId: string): Promise<boolean> {
  const post = await this.prisma.post.findUnique({
    where: { id: postId },
    select: {
      id: true,
      isDeleted: true,
      isHidden: true,
      authorId: true,
      overriddenByAdmin: true, // ❗ใช้ได้ก็ต่อเมื่อมี field นี้ใน schema
    },
  });

  if (!post) return false;

  // ❌ deleted post → no override
  if (post.isDeleted) return false;

  // ❌ already overridden → prevent stacking override
  if (post.overriddenByAdmin === true) return false;

  // 🔍 check author state separately (DB authority)
  const author = await this.prisma.user.findUnique({
    where: { id: post.authorId },
    select: { isDisabled: true },
  });

  // ❌ author already banned → visibility meaningless
  if (author?.isDisabled === true) return false;

  return true;
}


}
