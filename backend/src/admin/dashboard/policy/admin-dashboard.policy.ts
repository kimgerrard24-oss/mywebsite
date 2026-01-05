// backend/src/admin/dashboard/admin-dashboard.policy.ts

import { BadRequestException } from '@nestjs/common';
import { GetAdminDashboardQueryDto } from '../dto/get-admin-dashboard.query.dto';

export class AdminDashboardPolicy {
  static assertValidQuery(
    _query: GetAdminDashboardQueryDto,
  ) {
    // placeholder สำหรับ future
    // เช่น time range, super admin only widgets
    return true;
  }
}

