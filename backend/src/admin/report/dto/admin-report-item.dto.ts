// backend/src/admin/report/dto/admin-report-item.dto.ts

export class AdminReportItemDto {
  id!: string;
  targetType!: string;
  targetId!: string;
  reason!: string;
  status!: string;
  createdAt!: Date;

  reporter!: {
    id: string;
    username: string;
    displayName: string | null;
  };

  static from(entity: any): AdminReportItemDto {
    return {
      id: entity.id,
      targetType: entity.targetType,
      targetId: entity.targetId,
      reason: entity.reason,
      status: entity.status,
      createdAt: entity.createdAt,
      reporter: entity.reporter,
    };
  }
}
