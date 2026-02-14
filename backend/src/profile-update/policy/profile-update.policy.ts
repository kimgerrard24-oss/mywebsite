// backend/src/profile-update/profile-update.policy.ts

import { ForbiddenException } from '@nestjs/common';

export class ProfileUpdatePolicy {
  static assertCanCreateDraft(context: {
    isOwner: boolean;
    isBanned: boolean;
  }): void {
    if (!context.isOwner) {
      throw new ForbiddenException('PROFILE_UPDATE_NOT_OWNER');
    }

    if (context.isBanned) {
      throw new ForbiddenException('PROFILE_UPDATE_USER_BANNED');
    }
  }
}

