// backend/src/reports/audit/report.audit.ts

import { Injectable } from '@nestjs/common';
import { AuditService } from '../../auth/audit.service';

@Injectable()
export class ReportAudit {
  constructor(
    private readonly audit: AuditService,
  ) {}

  async reportCreated(params: {
    userId: string;
    targetType: string;
    targetId: string;
    email?: string; 
    ip?: string;
    userAgent?: string;
  }) {
    await this.audit.createLog({
      userId: params.userId,
      email: params.email ?? null, 
      action: 'report_create',
      success: true,
      targetId: params.targetId,
      metadata: {
        targetType: params.targetType,
      },
      ip: params.ip ?? null,
      userAgent: params.userAgent ?? null,
    });
  }

  async reportWithdrawn(params: {
    userId: string;
    reportId: string;
    email?: string; 
  }) {
    await this.audit.createLog({
      userId: params.userId,
      email: params.email ?? null, 
      action: 'report_withdraw',
      success: true,
      targetId: params.reportId,
    });
  }
}
