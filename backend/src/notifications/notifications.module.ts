// backend/src/notifications/notifications.module.ts
import { Module } from '@nestjs/common';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';
import { NotificationsRepository } from './notifications.repository';
import { NotificationCacheService } from './cache/notification-cache.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [ AuthModule ],
  controllers: [NotificationsController],
  providers: [
    NotificationsService,
    NotificationsRepository,
    NotificationCacheService,
  ],
})
export class NotificationsModule {}
