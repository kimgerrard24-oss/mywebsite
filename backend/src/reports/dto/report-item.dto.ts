// backend/src/reports/dto/report-item.dto.ts

import {
  ReportReason,
  ReportStatus,
  ReportTargetType,
} from '@prisma/client';

export class ReportItemDto {
  id!: string;
  targetType!: ReportTargetType;
  targetId!: string;
  reason!: ReportReason;
  status!: ReportStatus;
  createdAt!: string;

  static fromEntity(entity: any): ReportItemDto {
    return {
      id: entity.id,
      targetType: entity.targetType,
      targetId: entity.targetId,
      reason: entity.reason,
      status: entity.status,
      createdAt: entity.createdAt.toISOString(),
    };
  }
}
