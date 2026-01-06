// backend/src/admin/actions/policy/admin-actions.policy.ts

import {
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { GetAdminActionsQueryDto } from '../dto/get-admin-actions.query.dto';
import {
  ModerationActionType,
} from '@prisma/client';

/**
 * Business-level policy for Admin Actions
 *
 * - NOT authentication (handled by guards)
 * - NOT state validation (handled by service/repository)
 * - Pure business classification helpers
 */
export class AdminActionsPolicy {
  /**
   * ==================================================
   * Query validation
   * ==================================================
   */

  /**
   * List query validation
   * - used by GET /admin/actions
   */
  static assertValidQuery(
    query: GetAdminActionsQueryDto,
  ) {
    if (query.limit > 100) {
      throw new BadRequestException(
        'Limit exceeds maximum allowed',
      );
    }
  }

  /**
   * ==================================================
   * Read permission
   * ==================================================
   */

  /**
   * Read permission for a single action
   * - used by GET /admin/actions/:id
   *
   * NOTE:
   * - Auth / role check is already done by guards
   * - This is for future business rules only
   */
  static assertReadable(
    _action: unknown,
  ) {
    // Current rule:
    // - All ADMIN can read all actions

    // Future examples:
    // - super admin only
    // - legal hold / audit lock
    // - sensitive metadata masking

    return true;
  }

  /**
   * ==================================================
   * Action classification helpers
   * ==================================================
   *
   * - Pure helpers
   * - NO DB access
   * - NO side effects
   */

  /**
   * Whether an action represents a "hide" operation
   *
   * - Prisma enum: HIDE
   * - Legacy string-based: HIDE_*
   */
  static isHideAction(
    action: {
      actionType?: string;
    },
  ): boolean {
    if (!action?.actionType) {
      return false;
    }

    return (
      action.actionType ===
        ModerationActionType.HIDE ||
      action.actionType.startsWith('HIDE_')
    );
  }

  /**
   * Whether an action represents an "unhide" operation
   *
   * - Prisma enum: UNHIDE
   * - Legacy / future: UNHIDE_*
   */
  static isUnhideAction(
    action: {
      actionType?: string;
    },
  ): boolean {
    if (!action?.actionType) {
      return false;
    }

    return (
      action.actionType ===
        ModerationActionType.UNHIDE ||
      action.actionType.startsWith('UNHIDE_')
    );
  }

  /**
   * Whether an action is a reversible hide action
   *
   * NOTE:
   * - This does NOT check current state
   * - State validation is done by service/repository
   */
  static isReversibleHideAction(
    action: {
      actionType?: string;
    },
  ): boolean {
    return this.isHideAction(action);
  }
}
