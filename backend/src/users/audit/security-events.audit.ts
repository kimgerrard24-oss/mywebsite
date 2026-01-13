// backend/src/users/audit/security-events.audit.ts

import { Injectable } from '@nestjs/common';
import { AuditLogService } from './audit-log.service';

@Injectable()
export class SecurityEventsAudit {
  constructor(private readonly audit: AuditLogService) {}

  async logViewed(userId: string) {
    try {
      await this.audit.log({
        userId,
        action: 'USER_VIEW_SECURITY_EVENTS',
        success: true,
      });
    } catch {
      // never block main flow
    }
  }

  async logEmailChangeRequest(userId: string) {
    try {
      await this.audit.log({
        userId,
        action: 'USER_REQUEST_EMAIL_CHANGE',
        success: true,
      });
    } catch {
      // never block main flow
    }
  }

   async logEmailChangeConfirmed(userId: string) {
    try {
      await this.audit.log({
        userId,
        action: 'SECURITY_EMAIL_CHANGE_CONFIRMED',
        success: true,
      });
    } catch {}
  }
}
