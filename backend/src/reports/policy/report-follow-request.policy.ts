// backend/src/reports/policy/report-follow-request.policy.ts

import { ForbiddenException } from '@nestjs/common';

export class ReportFollowRequestPolicy {
  static assertCanReport(params: {
    isReporterDisabled: boolean;
    isReporterBanned: boolean;
    isReporterLocked: boolean;
    isSelfTarget: boolean;
  }) {
    if (params.isReporterDisabled) {
      throw new ForbiddenException('Account disabled');
    }

    if (params.isReporterBanned) {
      throw new ForbiddenException('Account banned');
    }

    if (params.isReporterLocked) {
      throw new ForbiddenException('Account locked');
    }

    if (params.isSelfTarget) {
      throw new ForbiddenException('Cannot report yourself');
    }
  }
}
