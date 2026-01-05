// backend/src/admin/dashboard/admin-dashboard.service.ts

import { Injectable } from '@nestjs/common';
import { AdminDashboardRepository } from './admin-dashboard.repository';
import { AdminDashboardPolicy } from './policy/admin-dashboard.policy';
import { GetAdminDashboardQueryDto } from './dto/get-admin-dashboard.query.dto';
import { AdminDashboardDto } from './dto/admin-dashboard.dto';

@Injectable()
export class AdminDashboardService {
  constructor(
    private readonly repo: AdminDashboardRepository,
  ) {}

  async getDashboard(
    query: GetAdminDashboardQueryDto,
  ): Promise<AdminDashboardDto> {
    AdminDashboardPolicy.assertValidQuery(query);

    const stats =
      await this.repo.getSystemStats();

    const moderation =
      await this.repo.getModerationStats();

    return {
      system: stats,
      moderation,
    };
  }
}
