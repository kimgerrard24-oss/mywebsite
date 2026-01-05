// backend/src/admin/dashboard/admin-dashboard.controller.ts

import {
  Controller,
  Get,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AccessTokenCookieAuthGuard } from '../../auth/guards/access-token-cookie.guard';
import { AdminRoleGuard } from '../guards/admin-role.guard';
import { AdminDashboardService } from './admin-dashboard.service';
import { GetAdminDashboardQueryDto } from './dto/get-admin-dashboard.query.dto';
import { AdminDashboardDto } from './dto/admin-dashboard.dto';

@Controller('admin/dashboard')
@UseGuards(
  AccessTokenCookieAuthGuard,
  AdminRoleGuard,
)
export class AdminDashboardController {
  constructor(
    private readonly service: AdminDashboardService,
  ) {}

  /**
   * GET /admin/dashboard
   * Admin overview (read-only)
   */
  @Get()
  async getDashboard(
    @Query() query: GetAdminDashboardQueryDto,
  ): Promise<AdminDashboardDto> {
    return this.service.getDashboard(query);
  }
}
