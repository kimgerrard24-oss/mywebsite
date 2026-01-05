// backend/src/reports/dto/report-detail.dto.ts

import {
  ReportReason,
  ReportStatus,
  ReportTargetType,
} from '@prisma/client';

export class ReportDetailDto {
  id!: string;
  targetType!: ReportTargetType;
  targetId!: string;
  reason!: ReportReason;
  description!: string | null;
  status!: ReportStatus;
  createdAt!: string;

  static fromEntity(entity: any): ReportDetailDto {
    return {
      id: entity.id,
      targetType: entity.targetType,
      targetId: entity.targetId,
      reason: entity.reason,
      description: entity.description,
      status: entity.status,
      createdAt: entity.createdAt.toISOString(),
    };
  }
}
