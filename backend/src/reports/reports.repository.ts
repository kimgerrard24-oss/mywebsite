// backend/src/reports/reports.repository.ts

import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  ReportStatus,
  ReportTargetType,
} from '@prisma/client';
import type { ReportReason } from '@prisma/client';

@Injectable()
export class ReportsRepository {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async findDuplicate(params: {
    reporterId: string;
    targetType: ReportTargetType;
    targetId: string;
  }) {
    const { reporterId, targetType, targetId } = params;

    return this.prisma.report.findUnique({
      where: {
        reporterId_targetType_targetId: {
          reporterId,
          targetType,
          targetId,
        },
      },
    });
  }

  async create(params: {
    reporterId: string;
    targetType: ReportTargetType;
    targetId: string;
    reason: ReportReason;
    description?: string;
  }) {
    const {
      reporterId,
      targetType,
      targetId,
      reason,
      description,
    } = params;

    return this.prisma.report.create({
      data: {
        reporterId,
        targetType,
        targetId,
        reason,
        description,
      },
    });
  }

  async findMyReports(params: {
    reporterId: string;
    cursor: string | null;
    limit: number;
  }) {
    const { reporterId, cursor, limit } = params;

    const items = await this.prisma.report.findMany({
      where: { reporterId },
      orderBy: { createdAt: 'desc' },
      take: limit + 1,
      ...(cursor
        ? { cursor: { id: cursor }, skip: 1 }
        : {}),
      select: {
        id: true,
        targetType: true,
        targetId: true,
        reason: true,
        status: true,
        createdAt: true,
      },
    });

    const hasNext = items.length > limit;
    const sliced = hasNext
      ? items.slice(0, limit)
      : items;

    return {
      items: sliced,
      nextCursor: hasNext
        ? sliced[sliced.length - 1].id
        : null,
    };
  }

  async findMyReportById(params: {
    reporterId: string;
    reportId: string;
  }) {
    const { reporterId, reportId } = params;

    return this.prisma.report.findFirst({
      where: {
        id: reportId,
        reporterId,
      },
      select: {
        id: true,
        targetType: true,
        targetId: true,
        reason: true,
        description: true,
        status: true,
        createdAt: true,
      },
    });
  }

  async findForWithdraw(params: {
    reportId: string;
    reporterId: string;
  }) {
    const { reportId, reporterId } = params;

    return this.prisma.report.findFirst({
      where: {
        id: reportId,
        reporterId,
      },
      select: {
        id: true,
        status: true,
      },
    });
  }

  async markWithdrawn(reportId: string) {
    return this.prisma.report.update({
      where: { id: reportId },
      data: {
        status: ReportStatus.WITHDRAWN,
      },
    });
  }

  /**
   * Resolve owner of report target
   * (Backend authority)
   */
  async findTargetOwnerId(params: {
    targetType: ReportTargetType;
    targetId: string;
  }): Promise<string | null> {
    const { targetType, targetId } = params;

    switch (targetType) {
      case ReportTargetType.POST: {
        const post = await this.prisma.post.findUnique({
          where: { id: targetId },
          select: { authorId: true },
        });

        if (!post) {
          throw new NotFoundException('Post not found');
        }

        return post.authorId;
      }

      case ReportTargetType.COMMENT: {
        const comment = await this.prisma.comment.findUnique({
          where: { id: targetId },
          select: { authorId: true },
        });

        if (!comment) {
          throw new NotFoundException('Comment not found');
        }

        return comment.authorId;
      }

      case ReportTargetType.USER: {
        const user = await this.prisma.user.findUnique({
          where: { id: targetId },
          select: { id: true },
        });

        if (!user) {
          throw new NotFoundException('User not found');
        }

        return user.id;
      }

      case ReportTargetType.CHAT_MESSAGE: {
        const message =
          await this.prisma.chatMessage.findUnique({
            where: { id: targetId },
            select: { senderId: true },
          });

        if (!message) {
          throw new NotFoundException(
            'Chat message not found',
          );
        }

        return message.senderId;
      }

      default:
        return null;
    }
  }

  /**
   * ==============================
   * Target Snapshot (for User Report Detail)
   * ==============================
   */

  async findPostSnapshotById(postId: string) {
    return this.prisma.post.findUnique({
      where: { id: postId },
      select: {
        id: true,
        content: true,
        createdAt: true,
        isHidden: true,
        isDeleted: true,
        deletedSource: true,
        author: {
          select: {
            id: true,
            username: true,
            displayName: true,
          },
        },
      },
    });
  }

  async findCommentSnapshotById(commentId: string) {
    return this.prisma.comment.findUnique({
      where: { id: commentId },
      select: {
        id: true,
        content: true,
        createdAt: true,
        isHidden: true,
        isDeleted: true,
        author: {
          select: {
            id: true,
            username: true,
            displayName: true,
          },
        },
        post: {
          select: {
            id: true,
          },
        },
      },
    });
  }

  async findUserSnapshotById(userId: string) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        displayName: true,
        createdAt: true,
        isDisabled: true,
      },
    });
  }

  async findChatMessageSnapshotById(messageId: string) {
    return this.prisma.chatMessage.findUnique({
      where: { id: messageId },
      select: {
        id: true,
        content: true,
        createdAt: true,
        isDeleted: true,
        sender: {
          select: {
            id: true,
            username: true,
            displayName: true,
          },
        },
      },
    });
  }
}
