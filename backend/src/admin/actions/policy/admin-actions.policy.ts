// backend/src/admin/actions/policy/admin-actions.policy.ts

import {
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { GetAdminActionsQueryDto } from '../dto/get-admin-actions.query.dto';

/**
 * Business-level policy for Admin Actions
 *
 * - NOT authentication (handled by guards)
 * - Used by:
 *   - GET /admin/actions
 *   - GET /admin/actions/:id
 */
export class AdminActionsPolicy {
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
}
