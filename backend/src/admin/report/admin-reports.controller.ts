// backend/src/admin/report/admin-reports.controller.ts

import {
  Controller,
  Get,
  Query,
  Param,
  UseGuards,
} from '@nestjs/common';
import { AdminReportsService } from './admin-reports.service';
import { GetAdminReportsQueryDto } from './dto/get-admin-reports.query.dto';
import { AccessTokenCookieAuthGuard } from '../../auth/guards/access-token-cookie.guard';
import { AdminRoleGuard } from '../guards/admin-role.guard';
import { GetAdminReportParamDto } from './dto/get-admin-report.param.dto';
import { AdminReportStatsDto } from './dto/admin-report-stats.dto';
import { RateLimit } from '../../common/rate-limit/rate-limit.decorator';

@Controller('admin/reports')
@UseGuards(
  AccessTokenCookieAuthGuard,
  AdminRoleGuard,
)
export class AdminReportsController {
  constructor(
    private readonly service: AdminReportsService,
  ) {}

  @Get()
  async getReports(
    @Query() query: GetAdminReportsQueryDto,
  ) {
    return this.service.getReports(query);
  }

  /**
   * GET /admin/reports/stats
   * Admin-only report statistics
   */
  @Get('stats')
  @RateLimit('adminUsersList') // reuse admin-safe bucket
  async getStats(): Promise<AdminReportStatsDto> {
    return this.service.getStats();
  }

    /**
   * GET /admin/reports/:id
   * - Read-only admin evidence view
   */
  @Get(':id')
  async getReportById(
    @Param() param: GetAdminReportParamDto,
  ) {
    return this.service.getReportById(param.id);
  }
}
