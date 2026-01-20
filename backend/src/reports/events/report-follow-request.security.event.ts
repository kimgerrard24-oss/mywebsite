// backend/src/reports/events/report-follow-request.security.event.ts

import { Injectable } from '@nestjs/common';
import { SecurityEventService } from '../../common/security/security-event.service';

@Injectable()
export class ReportFollowRequestSecurityEvent {
  constructor(
    private readonly security: SecurityEventService,
  ) {}

  emit(params: {
    reporterId: string;
    followRequestId: string;
    reason: string;
  }) {
    this.security.log({
      type: 'security.abuse.detected',
      severity: 'warning',
      userId: params.reporterId,
      reason: 'report_follow_request',
      meta: {
        followRequestId: params.followRequestId,
        reason: params.reason,
      },
    });
  }
}
