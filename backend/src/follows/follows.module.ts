// backend/src/follows/follow.module.ts
import { Module } from '@nestjs/common';
import { FollowsController } from './follows.controller';
import { FollowsService } from './follows.service';
import { FollowsRepository } from './follows.repository';
import { FollowCacheService } from './cache/follow-cache.service';
import { FollowCreatedEvent } from './events/follow-created.event';
import { FollowAudit } from './audit/follow.audit';
import { FollowRemovedEvent } from './events/follow-removed.event';
import { FollowersMapper } from './mappers/followers.mapper';
import { AuthModule } from '../auth/auth.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { FollowRequestsModule } from './follow-request/follow-requests.module';

@Module({
  imports: [ 
    AuthModule, 
    NotificationsModule,
    FollowRequestsModule,
  ],
  controllers: [FollowsController],
  providers: [
    FollowsService,
    FollowsRepository,
    FollowCacheService,
    FollowersMapper,
    FollowRemovedEvent,
    FollowCreatedEvent,
    FollowAudit,
  ],
  exports: [FollowsService],
})
export class FollowsModule {}
