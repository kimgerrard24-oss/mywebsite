// backend/src/admin/actions/dto/admin-action.dto.ts

export class AdminActionDto {
  id!: string;
  actionType!: string;
  targetType!: string;
  targetId!: string;
  reason!: string | null;
  createdAt!: Date;

  /**
   * ================================
   * UX Guard (Backend Authority)
   * ================================
   */
  canUnhide?: boolean;

  /**
   * Legacy admin field (optional)
   * - Used by old admin actions
   * - New audit actions may not have this
   */
  admin?: {
    id: string;
    username: string;
    displayName: string | null;
  };

  /**
   * Factory
   *
   * - Backward compatible
   * - Forward compatible
   * - DTO does NOT compute authority logic
   */
  static from(entity: any): AdminActionDto {
    return {
      id: entity.id,
      actionType: entity.actionType,
      targetType: entity.targetType,
      targetId: entity.targetId,
      reason: entity.reason ?? null,
      createdAt: entity.createdAt,

      canUnhide:
        typeof entity.canUnhide === 'boolean'
          ? entity.canUnhide
          : undefined,

      admin: entity.admin
        ? {
            id: entity.admin.id,
            username: entity.admin.username,
            displayName:
              entity.admin.displayName,
          }
        : undefined,
    };
  }
}
