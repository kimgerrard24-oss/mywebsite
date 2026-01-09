// backend/src/admin/appeals/admin-appeals.repository.ts

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { 
  AppealStatus, 
  AppealTargetType,
  Prisma,
 } from '@prisma/client';

@Injectable()
export class AdminAppealsRepository {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  private getSince(range: string) {
    const now = Date.now();

    if (range === '24h')
      return new Date(now - 24 * 60 * 60 * 1000);

    if (range === '30d')
      return new Date(now - 30 * 24 * 60 * 60 * 1000);

    return new Date(now - 7 * 24 * 60 * 60 * 1000);
  }

  async findAppeals(params: {
    status?: AppealStatus;
    targetType?: AppealTargetType;
    cursor?: string;
    limit: number;
  }) {
    const { status, targetType, cursor, limit } = params;

    return this.prisma.appeal.findMany({
      where: {
        ...(status ? { status } : {}),
        ...(targetType ? { targetType } : {}),
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit + 1, // cursor pagination
      ...(cursor
        ? {
            skip: 1,
            cursor: { id: cursor },
          }
        : {}),
      select: {
        id: true,
        userId: true,
        targetType: true,
        targetId: true,
        status: true,
        reason: true,
        createdAt: true,
        resolvedAt: true,
      },
    });
  }

  // ===== used by GET /admin/appeals/:id =====
  async findAppealById(appealId: string) {
    return this.prisma.appeal.findUnique({
      where: { id: appealId },
      select: {
        id: true,
        userId: true,
        targetType: true,
        targetId: true,
        status: true,
        reason: true,
        detail: true,
        createdAt: true,
        resolvedAt: true,
        resolutionNote: true,

        moderationAction: {
          select: {
            id: true,
            actionType: true,
            targetType: true,
            targetId: true,
            reason: true,
            createdAt: true,
          },
        },

        report: {
          select: {
            id: true,
            reason: true,
            createdAt: true,
          },
        },
      },
    });
  }

async resolveAppealTx(input: {
  adminUserId: string;
  appealId: string;
  decision: 'APPROVED' | 'REJECTED';
  resolutionNote?: string;
}) {
  return this.prisma.$transaction(
    async (tx) => {
      const appeal = await tx.appeal.findUnique({
        where: { id: input.appealId },
        select: {
          id: true,
          userId: true,
          status: true,
          targetType: true,
          targetId: true,
          moderationAction: {
            select: {
              actionType: true,
            },
          },
        },
      });

      if (!appeal) return null;

      if (appeal.status !== AppealStatus.PENDING) {
        return appeal;
      }

      // ===== update appeal status =====
      const resolved = await tx.appeal.update({
        where: { id: input.appealId },
        data: {
          status: input.decision,
          resolvedAt: new Date(),
          resolutionNote: input.resolutionNote ?? undefined,
          resolvedByAdminId: input.adminUserId,
        },
      });

      // ===== rollback moderation only if APPROVED and action matches =====
      if (input.decision === 'APPROVED') {
        const actionType =
          appeal.moderationAction?.actionType;

        if (
          appeal.targetType === 'POST' &&
          actionType === 'HIDE'
        ) {
          await tx.post.update({
            where: { id: appeal.targetId },
            data: {
              isHidden: false,
              hiddenAt: null,
            },
          });
        }

        if (
          appeal.targetType === 'COMMENT' &&
          actionType === 'HIDE'
        ) {
          await tx.comment.update({
            where: { id: appeal.targetId },
            data: {
              isHidden: false,
              hiddenAt: null,
            },
          });
        }

        if (
          appeal.targetType === 'CHAT_MESSAGE' &&
          actionType === 'HIDE'
        ) {
          await tx.chatMessage.update({
            where: { id: appeal.targetId },
            data: {
              isDeleted: false,
              deletedAt: null,
            },
          });
        }

        if (
          appeal.targetType === 'USER' &&
          actionType === 'BAN_USER'
        ) {
          await tx.user.update({
            where: { id: appeal.targetId },
            data: {
              isDisabled: false,
              disabledAt: null,
              bannedAt: null,
              banReason: null,
              bannedByAdminId: null,
            },
          });
        }
      }

      // ===== admin audit log =====
      await tx.adminActionLog.create({
        data: {
          adminId: input.adminUserId,
          action:
            input.decision === 'APPROVED'
              ? 'appeal.approved'
              : 'appeal.rejected',
          targetId: input.appealId,
          appealId: input.appealId,
          detail: input.resolutionNote
            ? { note: input.resolutionNote }
            : undefined,
        },
      });

      return resolved;
    },
    {
      isolationLevel:
        Prisma.TransactionIsolationLevel.Serializable,
    },
  );
}




   async aggregateStats(
  range: '24h' | '7d' | '30d',
) {
  const since = this.getSince(range);

  const [total, byStatus, resolved] =
    await Promise.all([
      // ===== total appeals =====
      this.prisma.appeal.count({
        where: { createdAt: { gte: since } },
      }),

      // ===== group by status =====
      this.prisma.appeal.groupBy({
        by: ['status'],
        _count: { _all: true },
        where: { createdAt: { gte: since } },
      }),

      // ===== resolved appeals (APPROVED / REJECTED) =====
      this.prisma.appeal.findMany({
        where: {
          status: {
            in: [
              AppealStatus.APPROVED,
              AppealStatus.REJECTED,
            ],
          },
          resolvedAt: { not: null },
          createdAt: { gte: since },
        },
        select: {
          createdAt: true,
          resolvedAt: true,
        },
      }),
    ]);

  // ===== Average resolve time =====
  type ResolvedRow = {
  createdAt: Date;
  resolvedAt: Date | null;
};

const resolvedRows = resolved as ResolvedRow[];

let avgResolveMs = 0;

if (resolvedRows.length > 0) {
  const sum = resolvedRows.reduce(
    (acc: number, r: ResolvedRow) => {
      if (!r.resolvedAt) return acc;

      return (
        acc +
        (r.resolvedAt.getTime() -
          r.createdAt.getTime())
      );
    },
    0,
  );

  avgResolveMs = Math.round(
    sum / resolvedRows.length,
  );
}


  // ===== status map =====
  const statusMap: Record<
    AppealStatus,
    number
  > = {
    PENDING: 0,
    APPROVED: 0,
    REJECTED: 0,
    WITHDRAWN: 0,
  };

  for (const s of byStatus) {
    statusMap[s.status] = s._count._all;
  }

  return {
    range,
    total,
    byStatus: {
      PENDING: statusMap.PENDING,
      APPROVED: statusMap.APPROVED,
      REJECTED: statusMap.REJECTED,
      WITHDRAWN: statusMap.WITHDRAWN,
    },
    avgResolveMs,
    generatedAt: new Date().toISOString(),
  };
}

}

