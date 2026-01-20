// backend/src/admin/moderation/follows/moderation-follows.module.ts

import { Module } from '@nestjs/common';
import { ModerationFollowsController } from './moderation-follows.controller';
import { ModerationFollowsService } from './moderation-follows.service';
import { ModerationFollowsRepository } from './moderation-follows.repository';
import { ForceRemoveFollowAudit } from './audit/force-remove-follow.audit';
import { UsersModule } from '../../../users/users.module';
import { NotificationsModule } from '../../../notifications/notifications.module';
import { AuthModule } from '../../../auth/auth.module';

@Module({
  imports: [
    UsersModule, 
    AuthModule,         // provides UsersRepository
    NotificationsModule,  // provides NotificationsService
  ],
  controllers: [ModerationFollowsController],
  providers: [
    ModerationFollowsService,
    ModerationFollowsRepository,
    ForceRemoveFollowAudit,
  ],
})
export class ModerationFollowsModule {}

