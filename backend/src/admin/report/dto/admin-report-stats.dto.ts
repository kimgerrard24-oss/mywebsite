// backend/src/admin/report/dto/admin-report-stats.dto.ts

import {
  ReportStatus,
  ReportTargetType,
} from '@prisma/client';

export class AdminReportStatsDto {
  total!: number;

  byStatus!: Record<ReportStatus, number>;

  byTargetType!: Record<
    ReportTargetType,
    number
  >;

  activity!: {
    last24h: number;
    last7d: number;
  };
}
