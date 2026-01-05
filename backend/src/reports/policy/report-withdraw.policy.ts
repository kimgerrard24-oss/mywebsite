// backend/src/reports/policy/report-withdraw.policy.ts

import {
  BadRequestException,
  Injectable,
} from '@nestjs/common';
import { ReportStatus } from '@prisma/client';

@Injectable()
export class ReportWithdrawPolicy {
  /**
   * Enforce withdraw rules
   */
  assertCanWithdraw(status: ReportStatus) {
    if (
      status === ReportStatus.ACTION_TAKEN
    ) {
      throw new BadRequestException(
        'Report cannot be withdrawn after action is taken',
      );
    }

    if (
      status === ReportStatus.REJECTED
    ) {
      throw new BadRequestException(
        'Rejected report cannot be withdrawn',
      );
    }
  }
}
