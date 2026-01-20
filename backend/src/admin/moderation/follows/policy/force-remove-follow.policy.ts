// backend/src/admin/moderation/follows/policy/force-remove-follow.policy.ts

import { ForbiddenException } from '@nestjs/common';

export class ForceRemoveFollowPolicy {
  static assertAllowed(params: {
    isAdminDisabled: boolean;
    isAdminBanned: boolean;
    isAdminLocked: boolean;
  }) {
    if (params.isAdminDisabled) {
      throw new ForbiddenException('Admin disabled');
    }

    if (params.isAdminBanned) {
      throw new ForbiddenException('Admin banned');
    }

    if (params.isAdminLocked) {
      throw new ForbiddenException('Admin account locked');
    }
  }
}

