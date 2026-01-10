// backend/src/moderation/user/dto/user-moderated-message.dto.ts

import { ModerationActionType } from '@prisma/client';

export class UserModeratedMessageDto {
  id!: string;

  content!: string | null;

  isDeleted!: boolean;

  createdAt!: Date;

  moderation!: {
    actionType: ModerationActionType;
    reason: string;
    createdAt: Date;
  } | null;

  hasPendingAppeal!: boolean;
}
