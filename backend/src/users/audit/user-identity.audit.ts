// backend/src/users/audit/user-identity.audit.ts

import { Injectable } from '@nestjs/common';
import { AuditLogService } from './audit-log.service';

@Injectable()
export class UserIdentityAudit {
  constructor(
    private readonly audit: AuditLogService,
  ) {}

  async logEmailChanged(userId: string) {
    try {
      await this.audit.log({
        userId,
        action: 'USER_EMAIL_CHANGED',
        success: true,
      });
    } catch {
      // must not break flow
    }
  }
 
  async logPhoneChangeRequest(userId: string) {
    try {
      await this.audit.log({
        userId,
        action: 'USER_PHONE_CHANGE_REQUEST',
        success: true,
      });
    } catch {}
  }

  logPhoneChanged(userId: string) {
    // fire-and-forget (no await in service)
    // could push to queue / external system
  }
  
}
