// backend/src/notifications/notifications.module.ts
import { Module, forwardRef } from '@nestjs/common';import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';
import { NotificationsRepository } from './notifications.repository';
import { NotificationCacheService } from './cache/notification-cache.service';
import { AuthModule } from '../auth/auth.module';
import { NotificationRealtimeModule } from './realtime/notification-realtime.module'
import { AuditService } from '../auth/audit.service';

@Module({
  imports: [
    forwardRef(() => AuthModule),
    NotificationRealtimeModule,
 ],
  controllers: [NotificationsController],
  providers: [
    NotificationsService,
    NotificationsRepository,
    NotificationCacheService,
    AuditService,
  ],
  exports: [ NotificationsService, NotificationCacheService, ],
  
})
export class NotificationsModule {}
