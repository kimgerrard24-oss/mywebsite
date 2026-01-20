// backend/src/follows/follow-request/follow-requests.module.ts

import { Module } from '@nestjs/common';
import { FollowRequestsController } from './follow-requests.controller';
import { FollowRequestsService } from './follow-requests.service';
import { FollowRequestsRepository } from './follow-requests.repository';
import { FollowRequestAudit } from './audit/follow-request.audit';
import { UsersRepository } from '../../users/users.repository';
import { AuditLogService } from '../../users/audit/audit-log.service';

@Module({
  controllers: [FollowRequestsController],
  providers: [
    FollowRequestsService,
    FollowRequestsRepository,
    FollowRequestAudit,
    UsersRepository,
    AuditLogService,
  ],
})
export class FollowRequestsModule {}

