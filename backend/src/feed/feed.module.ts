// backend/src/feed/feed.module.ts

import { Module } from '@nestjs/common';
import { FeedController } from './feed.controller';
import { FeedService } from './feed.service';
import { FeedRepository } from './feed.repository';
import { PrismaModule } from '../prisma/prisma.module';
import { PostsModule } from '../posts/posts.module';
import { FeedCacheService } from './cache/feed-cache.service';
import { RedisModule } from '../redis/redis.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    PrismaModule,
    RedisModule,
    AuthModule,
    PostsModule,
  ],
  controllers: [FeedController],
  providers: [
    FeedService,
    FeedRepository,
    FeedCacheService,
  ],
})
export class FeedModule {}
