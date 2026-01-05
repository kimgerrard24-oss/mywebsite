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
    return this.prisma.report.findUnique({
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

  // ✅ เตรียมค่า default ครบทุก enum
  const result: Record<ReportStatus, number> = {
    PENDING: 0,
    REVIEWED: 0,
    ACTION_TAKEN: 0,
    REJECTED: 0,
    WITHDRAWN: 0,
  };

  // ✅ merge ค่าจริงจาก DB
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
    }, {} as Record<ReportTargetType, number>);
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
