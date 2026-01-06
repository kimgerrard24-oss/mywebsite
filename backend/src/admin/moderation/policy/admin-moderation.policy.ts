// backend/src/admin/moderation/policy/admin-moderation.policy.ts

import { ForbiddenException } from '@nestjs/common';
import { CreateModerationActionDto } from '../dto/create-moderation-action.dto';
import {
  ModerationActionType,
  ModerationTargetType,
} from '@prisma/client';

/**
 * AdminModerationPolicy
 *
 * - Business-level authorization rules
 * - NO database access
 * - NO state inspection (handled by service/repository)
 */
export class AdminModerationPolicy {
  static assertAllowed(
    adminId: string,
    dto: CreateModerationActionDto,
  ) {
    /**
     * ❌ Admin cannot moderate self
     * - Applies to USER target only
     * - Includes BAN / UNHIDE / any future action
     */
    if (
      dto.targetType ===
        ModerationTargetType.USER &&
      dto.targetId === adminId
    ) {
      throw new ForbiddenException(
        'Admin cannot moderate self',
      );
    }

    /**
     * ❌ UNHIDE is not allowed for USER
     * (USER has BAN/UNBAN semantics, not hide/unhide)
     *
     * NOTE:
     * - State validity is checked later in service/repo
     * - This is a static business rule
     */
    if (
      dto.actionType ===
        ModerationActionType.UNHIDE &&
      dto.targetType ===
        ModerationTargetType.USER
    ) {
      throw new ForbiddenException(
        'User cannot be unhidden',
      );
    }

    /**
     * Future extensions:
     * - super-admin only actions
     * - irreversible action gates
     * - time-based moderation lock
     */

    return true;
  }
}
