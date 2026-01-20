// backend/src/reports/audit/report-follow-request.audit.ts

import { Injectable } from '@nestjs/common';
import { AuditService } from '../../auth/audit.service';

@Injectable()
export class ReportFollowRequestAudit {
  constructor(private readonly audit: AuditService) {}

  record(params: {
    reporterId: string;
    followRequestId: string;
    reason: string;
  }) {
    return this.audit.createLog({
      userId: params.reporterId,
      action: 'report.follow_request',
      success: true,
      targetId: params.followRequestId,
      metadata: {
        reason: params.reason,
      },
    });
  }
}
