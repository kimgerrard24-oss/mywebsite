// backend/src/admin/appeals/dto/admin-appeal-detail.dto.ts

import {
  AppealStatus,
  AppealTargetType,
  ModerationActionType,
} from '@prisma/client';

export class AdminAppealDetailDto {
  id!: string;

  userId!: string;

  targetType!: AppealTargetType;
  targetId!: string;

  status!: AppealStatus;

  reason!: string;
  detail!: string | null;

  createdAt!: Date;

  resolvedAt!: Date | null;
  resolutionNote!: string | null;

  // moderation context (optional but production-grade)
  moderationAction?: {
    id: string;
    actionType: ModerationActionType;
    targetType: string;
    targetId: string;
    reason: string;
    createdAt: Date;
  } | null;

  report?: {
    id: string;
    reason: string;
    createdAt: Date;
  } | null;
}

