// backend/src/users/policies/user-tag-settings-update.policy.ts

import {
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import type { TagAllowScope } from '../types/tag-allow-scope.type';

export class UserTagSettingsUpdatePolicy {
  static assertCanUpdate(params: {
    isDisabled: boolean;
    isBanned: boolean;
    isAccountLocked?: boolean;
  }) {
    if (params.isDisabled || params.isBanned) {
      throw new ForbiddenException(
        'Account is not allowed to update settings',
      );
    }
  }

  static sanitize(dto: {
    allowTagFrom?: TagAllowScope;
    requireApproval?: boolean;
  }) {
    if (
      dto.allowTagFrom === undefined &&
      dto.requireApproval === undefined
    ) {
      throw new BadRequestException(
        'No settings provided to update',
      );
    }

    return dto;
  }
}

