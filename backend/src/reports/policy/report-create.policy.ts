// backend/src/reports/policy/report-create.policy.ts

import {
  ForbiddenException,
  Injectable,
} from '@nestjs/common';

@Injectable()
export class ReportCreatePolicy {
  assertCanReport(params: {
    reporterId: string;
    targetOwnerId?: string | null;
  }) {
    const { reporterId, targetOwnerId } = params;

    // ❌ report ตัวเองไม่ได้
    if (
      targetOwnerId &&
      targetOwnerId === reporterId
    ) {
      throw new ForbiddenException(
        'Cannot report your own content',
      );
    }
  }
}

