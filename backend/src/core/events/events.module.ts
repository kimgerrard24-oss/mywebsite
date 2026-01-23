// backend/src/core/events/events.module.ts

import { Module } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { PrismaModule } from '../../prisma/prisma.module';
import { NotificationsModule } from '../../notifications/notifications.module';
import { FeedEventsListener } from './feed-events.listener';

/**
 * =========================================================
 * EventsModule (Domain Event Infrastructure)
 * =========================================================
 *
 * - Central event bus for domain events
 * - Used for async fan-out workers (feed, notification, audit, etc.)
 * - Can be replaced by MQ/Kafka in future with same interface
 */
@Module({
  imports: [
    EventEmitterModule.forRoot({
      wildcard: false,
      delimiter: '.',
      maxListeners: 50,
      verboseMemoryLeak: false,
      ignoreErrors: false,
    }),
      PrismaModule,
      NotificationsModule,
  ],

 providers: [
    FeedEventsListener, // ✅ register here
  ],
  exports: [EventEmitterModule],
})
export class EventsModule {}
