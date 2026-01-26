// backend/src/users/audit/user-tag-settings.audit.ts

import { Injectable } from '@nestjs/common';
import { AuditLogService } from './audit-log.service';

@Injectable()
export class UserTagSettingsAudit {
  constructor(
    private readonly audit: AuditLogService,
  ) {}

  async logUpdated(params: {
    userId: string;
    fields: string[];
  }) {
    try {
      await this.audit.log({
        userId: params.userId,
        action: 'USER_TAG_SETTINGS_UPDATED',
        success: true,
        metadata: {               
          fields: params.fields,
        },
      });
    } catch {
      // fail-soft
    }
  }
}
