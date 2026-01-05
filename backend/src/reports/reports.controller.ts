// backend/src/reports/reports.controller.ts

import {
  Body,
  Controller,
  Post,
  Get,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AccessTokenCookieAuthGuard } from '../auth/guards/access-token-cookie.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { SessionUser } from '../auth/services/validate-session.service';
import { ReportsService } from './reports.service';
import { CreateReportDto } from './dto/create-report.dto';
import { RateLimit } from '../common/rate-limit/rate-limit.decorator';
import { GetMyReportsQueryDto } from './dto/get-my-reports.query.dto';
import { GetMyReportParamDto } from './dto/get-my-report.param.dto';
import { WithdrawReportParamDto } from './dto/withdraw-report.param.dto';

@Controller('reports')
export class ReportsController {
  constructor(
    private readonly reportsService: ReportsService,
  ) {}

  /**
   * POST /reports
   * User creates a report
   */
  @Post()
  @UseGuards(AccessTokenCookieAuthGuard)
  @RateLimit('reportCreate')
  async createReport(
    @CurrentUser() user: SessionUser,
    @Body() dto: CreateReportDto,
  ) {
    await this.reportsService.createReport({
      reporterId: user.userId,
      reporterEmail: user.email,
      dto,
    });

    return { success: true };
  }

   /**
   * GET /reports/me
   * User reads own reports only
   */
  @Get('me')
  @UseGuards(AccessTokenCookieAuthGuard)
  @RateLimit('reportRead')
  async getMyReports(
    @CurrentUser() user: SessionUser,
    @Query() query: GetMyReportsQueryDto,
  ) {
    return this.reportsService.getMyReports({
      reporterId: user.userId,
      cursor: query.cursor ?? null,
      limit: query.limit,
    });
  }

   /**
   * GET /reports/me/:id
   * User reads own report (detail)
   */
  @Get('me/:id')
  @UseGuards(AccessTokenCookieAuthGuard)
  @RateLimit('reportReadDetail')
  async getMyReportById(
    @CurrentUser() user: SessionUser,
    @Param() param: GetMyReportParamDto,
  ) {
    return this.reportsService.getMyReportById({
      reporterId: user.userId,
      reportId: param.id,
    });
  }

   /**
   * POST /reports/:id/withdraw
   * User withdraws own report
   */
  @Post(':id/withdraw')
  @UseGuards(AccessTokenCookieAuthGuard)
  @RateLimit('reportWithdraw')
  async withdrawReport(
    @CurrentUser() user: SessionUser,
    @Param() param: WithdrawReportParamDto,
  ) {
    await this.reportsService.withdrawReport({
      reporterId: user.userId,
      reporterEmail: user.email,
      reportId: param.id,
    });

    return { success: true };
  }
}
