// backend/src/admin/dashboard/admin-dashboard.repository.ts

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AdminDashboardRepository {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async getSystemStats() {
    const [
      userCount,
      postCount,
      commentCount,
    ] = await this.prisma.$transaction([
      this.prisma.user.count(),
      this.prisma.post.count({
        where: { isDeleted: false },
      }),
      this.prisma.comment.count({
        where: { isDeleted: false },
      }),
    ]);

    return {
      userCount,
      postCount,
      commentCount,
    };
  }

  async getModerationStats() {
    const pendingReports =
      await this.prisma.report.count({
        where: { status: 'PENDING' },
      });

    const disabledUsers =
      await this.prisma.user.count({
        where: { isDisabled: true },
      });

    return {
      pendingReports,
      disabledUsers,
    };
  }
}


