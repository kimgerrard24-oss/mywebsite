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

  /**
   * ===== Target Snapshot (read-only evidence) =====
   * - Provided by service only
   * - Backend is authority
   * - Optional (target may be deleted)
   */
  targetSnapshot?: any;

  static fromEntity(entity: any): ReportDetailDto {
    return {
      id: entity.id,
      targetType: entity.targetType,
      targetId: entity.targetId,
      reason: entity.reason,
      description: entity.description,
      status: entity.status,
      createdAt: entity.createdAt.toISOString(),

      /**
       * 🔒 Attach snapshot only if service resolved it
       * Do NOT infer or recompute here
       */
      targetSnapshot: entity.targetSnapshot
        ? entity.targetSnapshot
        : undefined,
    };
  }
}

