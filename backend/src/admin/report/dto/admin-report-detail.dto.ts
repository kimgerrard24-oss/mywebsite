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
   * ===== Target state (UX helper only)
   * Backend is authority
   */
  target?: {
    isHidden: boolean;
  };

  /**
   * ===== Target snapshot (Admin evidence view)
   * Read-only, backend-authoritative
   * Shape depends on targetType
   */
  targetSnapshot?:
    | {
        type: 'POST';
        id: string;
        content: string;
        createdAt: Date;
        isHidden: boolean;
        isDeleted: boolean;
        deletedSource?: string | null;
        author: {
          id: string;
          username: string;
          displayName: string | null;
        };
        stats: {
          commentCount: number;
          likeCount: number;
        };
      }
    | {
        type: 'COMMENT';
        id: string;
        content: string;
        createdAt: Date;
        isHidden: boolean;
        isDeleted: boolean;
        author: {
          id: string;
          username: string;
          displayName: string | null;
        };
        post: {
          id: string;
        };
      }
    | {
        type: 'USER';
        id: string;
        username: string;
        displayName: string | null;
        createdAt: Date;
        isDisabled: boolean;
      }
    | {
        type: 'CHAT_MESSAGE';
        id: string;
        content: string;
        createdAt: Date;
        isDeleted: boolean;
        sender: {
          id: string;
          username: string;
          displayName: string | null;
        };
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
       * 🔒 Optional target state (UX helper)
       */
      target: entity.target
        ? {
            isHidden: entity.target.isHidden === true,
          }
        : undefined,

      /**
       * ===== Target snapshot (Admin evidence)
       * Provided only when service resolves it
       */
      targetSnapshot: entity.targetSnapshot
        ? entity.targetSnapshot
        : undefined,
    };
  }
}

