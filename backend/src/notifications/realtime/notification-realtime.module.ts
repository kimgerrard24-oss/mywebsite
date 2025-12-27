// backend/src/notifications/realtime/notification-realtime.module.ts

import { Module } from '@nestjs/common';
import { NotificationGateway } from './notification.gateway';
import { NotificationRealtimeService } from './notification-realtime.service';
import { RedisModule } from '../../redis/redis.module';

@Module({
  imports: [RedisModule],
  providers: [
    NotificationGateway,
    NotificationRealtimeService,
  ],
  exports: [NotificationRealtimeService],
})
export class NotificationRealtimeModule {}
