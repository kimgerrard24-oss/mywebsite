// backend/src/admin/moderation/follows/audit/force-remove-follow.audit.ts

import { Injectable } from '@nestjs/common';
import { AuditService } from '../../../../auth/audit.service';

@Injectable()
export class ForceRemoveFollowAudit {
  constructor(
    private readonly audit: AuditService,
  ) {}

  async record(params: {
    adminId: string;
    followerId: string;
    followingId: string;
    reason: string;
  }) {
    await this.audit.createLog({
      userId: params.adminId,
      action: 'moderation.follow.force_remove',
      success: true,
      targetId: `${params.followerId}:${params.followingId}`,
      metadata: {
        reason: params.reason,
      },
    });
  }
}

