// backend/src/follows/follow-request/follow-requests.module.ts

import { Module } from '@nestjs/common';
import { FollowRequestsController } from './follow-requests.controller';
import { FollowRequestsService } from './follow-requests.service';
import { FollowRequestsRepository } from './follow-requests.repository';
import { FollowRequestAudit } from './audit/follow-request.audit';
import { UsersRepository } from '../../users/users.repository';
import { AuditLogService } from '../../users/audit/audit-log.service';
import { NotificationsModule } from '../../notifications/notifications.module';
import { AuthModule } from '../../auth/auth.module';

@Module({
   imports: [
    NotificationsModule,
    AuthModule,  
  ],
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

