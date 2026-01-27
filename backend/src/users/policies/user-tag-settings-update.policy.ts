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

  /**
   * =================================================
   * Sanitize & validate DTO
   * - DO NOT map to DB fields here
   * - Repository is the only place that maps API → DB
   * =================================================
   */
  static sanitize(dto: {
    allowTagFrom?: TagAllowScope;
    requireApproval?: boolean;
  }): {
    allowTagFrom?: TagAllowScope;
    requireApproval?: boolean;
  } {
    if (
      dto.allowTagFrom === undefined &&
      dto.requireApproval === undefined
    ) {
      throw new BadRequestException(
        'No settings provided to update',
      );
    }

    const update: {
      allowTagFrom?: TagAllowScope;
      requireApproval?: boolean;
    } = {};

    // =========================
    // TAG SCOPE (pass-through)
    // =========================
    if (dto.allowTagFrom !== undefined) {
      switch (dto.allowTagFrom) {
        case 'ANYONE':
        case 'FOLLOWERS':
        case 'NO_ONE':
          update.allowTagFrom = dto.allowTagFrom;
          break;

        default:
          throw new BadRequestException(
            'Invalid allowTagFrom value',
          );
      }
    }

    // =========================
    // APPROVAL MODE (pass-through)
    // =========================
    if (dto.requireApproval !== undefined) {
      update.requireApproval = dto.requireApproval;
    }

    return update;
  }
}


