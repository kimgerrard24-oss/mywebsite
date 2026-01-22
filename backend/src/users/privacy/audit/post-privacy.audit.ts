// backend/src/users/privacy/audit/post-privacy.audit.ts

import { Injectable } from '@nestjs/common';
import { AuditLogService } from '../../audit/audit-log.service';

@Injectable()
export class PostPrivacyAudit {
  constructor(private readonly audit: AuditLogService) {}

  async logChanged(params: {
    userId: string;
    from: boolean;
    to: boolean;
    ip?: string;
    userAgent?: string;
  }) {
    try {
      await this.audit.log({
        userId: params.userId,
        action: 'user.post_privacy.changed',
        success: true,
        metadata: {
          from: params.from,
          to: params.to,
        },
        ip: params.ip,
        userAgent: params.userAgent,
      });
    } catch {
      // fail-soft (never break business flow)
    }
  }
}
