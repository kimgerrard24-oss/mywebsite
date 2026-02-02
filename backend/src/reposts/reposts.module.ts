// backend/src/reposts/reposts.module.ts

import { Module } from '@nestjs/common';
import { RepostsController } from './reposts.controller';
import { RepostsService } from './reposts.service';
import { RepostsRepository } from './reposts.repository';
import { PostsVisibilityService } from '../posts/visibility/posts-visibility.service';
import { PostsVisibilityRepository } from '../posts/visibility/posts-visibility.repository';
import { PostRepostedListener } from './listeners/post-reposted.listener'
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    AuthModule, 
    PrismaModule,
    NotificationsModule,
  ],
  controllers: [RepostsController],
  providers: [
    RepostsService,
    RepostsRepository,
    PostRepostedListener,
    PostsVisibilityService,
    PostsVisibilityRepository,
  ],
  exports: [RepostsRepository],
})
export class RepostsModule {}
