// backend/src/admin/moderation/dto/moderation-action.dto.ts

export class ModerationActionDto {
  id!: string;
  actionType!: string;
  targetType!: string;
  targetId!: string;
  reason!: string;
  createdAt!: Date;
}

