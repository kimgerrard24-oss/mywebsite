// backend/src/admin/report/admin-reports.repository.ts

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { GetAdminReportsQueryDto } from './dto/get-admin-reports.query.dto';

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
}
