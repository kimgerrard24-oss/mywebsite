// backend/src/admin/report/policy/admin-report.policy.ts

import {
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { GetAdminReportsQueryDto } from '../dto/get-admin-reports.query.dto';

/**
 * AdminReportPolicy
 *
 * - Centralized policy for admin report access
 * - Used by:
 *   - GET /admin/reports
 *   - GET /admin/reports/:id
 *
 * IMPORTANT:
 * - AuthN (JWT + Redis session) is handled by guards
 * - This policy ONLY handles business-level authorization
 */
export class AdminReportPolicy {
  /**
   * Validate query parameters for
   * GET /admin/reports
   */
  static assertValidQuery(
    query: GetAdminReportsQueryDto,
  ) {
    if (query.limit > 100) {
      throw new BadRequestException(
        'Limit exceeds maximum allowed',
      );
    }
  }

  /**
   * Validate read permission for
   * GET /admin/reports/:id
   *
   * NOTE:
   * - Guard already ensures role === ADMIN
   * - This method is for future-proof rules:
   *   - sensitive reports
   *   - super-admin only cases
   *   - legal / compliance lock
   */
  static assertReadable(
    report: {
      isSensitive?: boolean | null;
      restrictedToSuperAdmin?: boolean | null;
    } & Record<string, unknown>,
  ) {
    // 🔒 Future super-admin restriction
    if (report.restrictedToSuperAdmin) {
      throw new ForbiddenException(
        'This report is restricted to super admin',
      );
    }

    // 🔒 Sensitive content hook (currently allowed)
    if (report.isSensitive) {
      // intentionally allowed for ADMIN
      // future compliance logic goes here
    }

    return true;
  }
}
