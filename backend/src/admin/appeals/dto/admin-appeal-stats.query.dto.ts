// backend/src/admin/appeals/dto/admin-appeal-stats.query.dto.ts

import { IsIn, IsOptional } from 'class-validator';

export class AdminAppealStatsQueryDto {
  /**
   * time range for dashboard
   * 24h | 7d | 30d
   */
  @IsOptional()
  @IsIn(['24h', '7d', '30d'])
  range?: '24h' | '7d' | '30d';
}
