// backend/src/admin/report/admin-reports.service.ts

import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { AdminReportsRepository } from './admin-reports.repository';
import { GetAdminReportsQueryDto } from './dto/get-admin-reports.query.dto';
import { AdminReportListDto } from './dto/admin-report-list.dto';
import { AdminReportPolicy } from './policy/admin-report.policy';
import { AdminReportDetailDto } from './dto/admin-report-detail.dto';
import { AdminReportStatsDto } from './dto/admin-report-stats.dto';

@Injectable()
export class AdminReportsService {
  constructor(
    private readonly repo: AdminReportsRepository,
  ) {}

  async getReports(
    query: GetAdminReportsQueryDto,
  ): Promise<AdminReportListDto> {
    AdminReportPolicy.assertValidQuery(query);

    const { items, total } =
      await this.repo.findReports(query);

    return AdminReportListDto.from({
      items,
      total,
      page: query.page,
      limit: query.limit,
    });
  }

  /**
   * GET /admin/reports/:id
   * - Read-only admin evidence view
   * - Backend is authority
   * - Includes optional target state (isHidden)
   */
  async getReportById(
    reportId: string,
  ): Promise<AdminReportDetailDto> {
    const report =
      await this.repo.findReportById(reportId);

    if (!report) {
      throw new NotFoundException(
        'Report not found',
      );
    }

    // 🔒 Business rule: admin can read only allowed reports
    AdminReportPolicy.assertReadable(report);

    /**
     * IMPORTANT:
     * - Do NOT strip extra fields (e.g. report.target)
     * - DTO is responsible for shaping response
     */
    return AdminReportDetailDto.from(report);
  }

  /**
   * GET /admin/reports/stats
   * - Admin-only statistics
   */
  async getStats(): Promise<AdminReportStatsDto> {
    const [
      total,
      byStatus,
      byTarget,
      last24h,
      last7d,
    ] = await Promise.all([
      this.repo.countAll(),
      this.repo.countByStatus(),
      this.repo.countByTargetType(),
      this.repo.countCreatedSince(1),
      this.repo.countCreatedSince(7),
    ]);

    return {
      total,
      byStatus,
      byTargetType: byTarget,
      activity: {
        last24h,
        last7d,
      },
    };
  }
}
