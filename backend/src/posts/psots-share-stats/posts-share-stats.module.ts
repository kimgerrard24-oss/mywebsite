// backend/src/posts/share-stats/posts-share-stats.module.ts

import { Module } from '@nestjs/common';

import { PrismaModule } from '../../prisma/prisma.module';
import { AuthModule } from '../../auth/auth.module';

import { PostsShareStatsController } from './posts-share-stats.controller';
import { PostsShareStatsService } from './posts-share-stats.service';
import { PostsShareStatsRepository } from './posts-share-stats.repository';

@Module({
  imports: [
    AuthModule,
    PrismaModule,
  ],
  controllers: [PostsShareStatsController],
  providers: [
    PostsShareStatsService,
    PostsShareStatsRepository,
  ],
})
export class PostsShareStatsModule {}
