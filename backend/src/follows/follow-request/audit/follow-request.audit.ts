// backend/src/follows/follow-request/audit/follow-request.audit.ts

import { Injectable } from '@nestjs/common';
import { AuditLogService } from '../../../users/audit/audit-log.service';

@Injectable()
export class FollowRequestAudit {
  constructor(
    private readonly audit: AuditLogService,
  ) {}

  async recordCreate(params: {
    requesterId: string;
    targetUserId: string;
  }) {
    await this.audit.log({
      userId: params.requesterId,
      action: 'FOLLOW_REQUEST_CREATE',
      targetId: params.targetUserId,
      success: true,
    });
  }

  async recordBlocked(params: {
    requesterId: string;
    targetUserId: string;
  }) {
    await this.audit.log({
      userId: params.requesterId,
      action: 'FOLLOW_REQUEST_BLOCKED',
      targetId: params.targetUserId,
      success: false,
    });
  }

  approved(params: {
    actorUserId: string;
    requesterId: string;
  }) {
    return this.audit.log({
      userId: params.actorUserId,
      action: 'follow_request.approved',
      success: true,
      targetId: params.requesterId,
    });
  }

   async rejected(params: {
    actorUserId: string;
    requesterId: string;
  }) {
    await this.audit.log({
      userId: params.actorUserId,
      action: 'follow_request.rejected',
      success: true,
      targetId: params.requesterId,
    });
  }
}
