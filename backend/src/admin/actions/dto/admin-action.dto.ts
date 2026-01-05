// backend/src/admin/actions/dto/admin-action.dto.ts

export class AdminActionDto {
  id!: string;
  actionType!: string;
  targetType!: string;
  targetId!: string;
  reason!: string;
  createdAt!: Date;

  admin!: {
    id: string;
    username: string;
    displayName: string | null;
  };

  static from(entity: any): AdminActionDto {
    return {
      id: entity.id,
      actionType: entity.actionType,
      targetType: entity.targetType,
      targetId: entity.targetId,
      reason: entity.reason,
      createdAt: entity.createdAt,
      admin: {
        id: entity.admin.id,
        username: entity.admin.username,
        displayName: entity.admin.displayName,
      },
    };
  }
}

