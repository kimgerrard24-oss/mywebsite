// backend/src/moderation/user/types/moderation.types.ts

import { ModerationActionType } from '@prisma/client';

export type ModerationSummary = {
  id: string;
  actionType: ModerationActionType;
  reason: string;
  createdAt: Date;
};
