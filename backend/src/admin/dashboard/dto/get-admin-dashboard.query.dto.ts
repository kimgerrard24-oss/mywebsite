// backend/src/admin/dashboard/dto/get-admin-dashboard.query.dto.ts

import { IsOptional, IsString } from 'class-validator';

export class GetAdminDashboardQueryDto {
  /**
   * Future extension:
   * - range=daily|weekly|monthly
   */
  @IsOptional()
  @IsString()
  range?: string;
}
