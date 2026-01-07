// backend/src/admin/report/admin-reports.repository.ts

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { GetAdminReportsQueryDto } from './dto/get-admin-reports.query.dto';
import {
  ReportStatus,
  ReportTargetType,
} from '@prisma/client';

@Injectable()
export class AdminReportsRepository {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async findReports(
    query: GetAdminReportsQueryDto,
  ) {
    const where: any = {};

    if (query.status) {
      where.status = query.status;
    }

    if (query.targetType) {
      where.targetType = query.targetType;
    }

    const [items, total] =
      await this.prisma.$transaction([
        this.prisma.report.findMany({
          where,
          orderBy: {
            createdAt: 'desc',
          },
          skip: (query.page - 1) * query.limit,
          take: query.limit,
          include: {
            reporter: {
              select: {
                id: true,
                username: true,
                displayName: true,
              },
            },
          },
        }),
        this.prisma.report.count({ where }),
      ]);

    return { items, total };
  }

  async findReportById(id: string) {
    const report =
      await this.prisma.report.findUnique({
        where: { id },
        include: {
          reporter: {
            select: {
              id: true,
              username: true,
              displayName: true,
            },
          },
          resolvedByAdmin: {
            select: {
              id: true,
              username: true,
              displayName: true,
            },
          },
        },
      });

    if (!report) {
      return null;
    }

    /**
     * ===== Resolve target state (UX guard only)
     * Backend is authority
     */
    let target:
      | { isHidden: boolean }
      | undefined;

    try {
      switch (report.targetType) {
        case ReportTargetType.POST: {
          const post =
            await this.prisma.post.findUnique({
              where: { id: report.targetId },
              select: {
                isHidden: true,
                isDeleted: true,
              },
            });

          if (post) {
            target = {
              isHidden:
                post.isHidden === true ||
                post.isDeleted === true,
            };
          }
          break;
        }

        case ReportTargetType.COMMENT: {
          const comment =
            await this.prisma.comment.findUnique({
              where: { id: report.targetId },
              select: {
                isHidden: true,
                isDeleted: true,
              },
            });

          if (comment) {
            target = {
              isHidden:
                comment.isHidden === true ||
                comment.isDeleted === true,
            };
          }
          break;
        }

        case ReportTargetType.CHAT_MESSAGE: {
          const message =
            await this.prisma.chatMessage.findUnique({
              where: { id: report.targetId },
              select: {
                isDeleted: true,
              },
            });

          if (message) {
            target = {
              isHidden: message.isDeleted === true,
            };
          }
          break;
        }

        case ReportTargetType.USER: {
          const user =
            await this.prisma.user.findUnique({
              where: { id: report.targetId },
              select: {
                isDisabled: true,
              },
            });

          if (user) {
            target = {
              isHidden: user.isDisabled === true,
            };
          }
          break;
        }
      }
    } catch {
      // production-safe: do not block report view
    }

    return {
      ...report,
      target,
    };
  }

  /**
   * ==============================
   * Target snapshot (admin evidence)
   * ==============================
   * Used by AdminReportsService.getReportById
   * Backend is authority
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
      _count: {
        select: {
          comments: true,
          likes: true,
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

  async countAll(): Promise<number> {
    return this.prisma.report.count();
  }

  async countByStatus(): Promise<
    Record<ReportStatus, number>
  > {
    const rows =
      await this.prisma.report.groupBy({
        by: ['status'],
        _count: { _all: true },
      });

    const result: Record<
      ReportStatus,
      number
    > = {
      PENDING: 0,
      REVIEWED: 0,
      ACTION_TAKEN: 0,
      REJECTED: 0,
      WITHDRAWN: 0,
    };

    for (const r of rows) {
      result[r.status] = r._count._all;
    }

    return result;
  }

  async countByTargetType(): Promise<
    Record<ReportTargetType, number>
  > {
    const rows =
      await this.prisma.report.groupBy({
        by: ['targetType'],
        _count: { _all: true },
      });

    return rows.reduce((acc, r) => {
      acc[r.targetType] =
        r._count._all;
      return acc;
    }, {} as Record<
      ReportTargetType,
      number
    >);
  }

  countCreatedSince(
    days: number,
  ): Promise<number> {
    const since = new Date();
    since.setDate(
      since.getDate() - days,
    );

    return this.prisma.report.count({
      where: {
        createdAt: {
          gte: since,
        },
      },
    });
  }
}

