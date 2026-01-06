// backend/src/admin/report/dto/admin-report-detail.dto.ts

export class AdminReportDetailDto {
  id!: string;
  targetType!: string;
  targetId!: string;
  reason!: string;
  description?: string | null;
  status!: string;
  createdAt!: Date;

  reporter!: {
    id: string;
    username: string;
    displayName: string | null;
  };

  resolvedByAdmin?: {
    id: string;
    username: string;
    displayName: string | null;
  } | null;

  resolvedAt?: Date | null;
  resolutionNote?: string | null;

  /**
   * ===== Target state (NEW)
   * UX helper only — backend is authority
   */
  target?: {
    isHidden: boolean;
  };

  static from(entity: any): AdminReportDetailDto {
    return {
      id: entity.id,
      targetType: entity.targetType,
      targetId: entity.targetId,
      reason: entity.reason,
      description: entity.description,
      status: entity.status,
      createdAt: entity.createdAt,

      reporter: entity.reporter,

      resolvedByAdmin: entity.resolvedByAdmin ?? null,
      resolvedAt: entity.resolvedAt ?? null,
      resolutionNote: entity.resolutionNote ?? null,

      /**
       * 🔒 Optional target state
       * - Provided only when repository resolves it
       * - Safe default = not hidden
       */
      target: entity.target
        ? {
            isHidden: entity.target.isHidden === true,
          }
        : undefined,
    };
  }
}
