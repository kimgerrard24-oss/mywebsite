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
    };
  }
}
