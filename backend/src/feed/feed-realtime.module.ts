// backend/src/feed/feed-realtime.module.ts

import { Module } from '@nestjs/common';
import { FeedGateway } from './realtime/feed.gateway';
import { FeedRealtimeService } from './realtime/feed-realtime.service';
import { FeedTargetService } from './realtime/feed-target.service';
import { FeedRealtimePolicy } from './realtime/feed-realtime.policy';
import { RedisModule } from '../redis/redis.module';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [
    RedisModule,
    PrismaModule,
  ],
  providers: [
    FeedGateway,
    FeedRealtimeService,
    FeedTargetService,
    FeedRealtimePolicy,
  ],
  exports: [
    FeedRealtimeService,
    FeedTargetService,
    FeedRealtimePolicy,
  ],
})
export class FeedRealtimeModule {}
