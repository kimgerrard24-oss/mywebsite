// backend/src/posts/posts.module.ts
import { Module } from '@nestjs/common';
import { PostsController } from './posts.controller';
import { PostsService } from './posts.service';
import { PostsRepository } from './posts.repository';
import { PostAudit } from './audit/post.audit';
import { PostCreatedEvent } from './events/post-created.event';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { PostVisibilityService } from './services/post-visibility.service';
import { PostCacheService } from './cache/post-cache.service';
import { PostDeletePolicy } from './policy/post-delete.policy';
import { PostUpdatePolicy } from './policy/post-update.policy';
import { PostLikePolicy } from './policy/post-like.policy';
import { PostLikedEvent } from './events/post-liked.event';
import { PostUnlikePolicy } from './policy/post-unlike.policy';
import { CommentsModule } from '../comments/comments.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { PostsVisibilityModule } from './visibility/posts-visibility.module';
import { PostUserTagListener } from './listeners/post-user-tag.listener'
import { PostUserTagViewPolicy } from './policy/post-user-tag-view.policy';
import { PostUserTagCreatePolicy } from './policy/post-user-tag-create.policy';
import { PostUserTagUpdatePolicy } from './policy/post-user-tag-update.policy';
import { PostUserTagRemovePolicy } from './policy/post-user-tag-remove.policy';
import { PostUserTagAcceptPolicy } from './policy/post-user-tag-accept.policy';
import { PostUserTagRejectPolicy } from './policy/post-user-tag-reject.policy';
import { PostsPublicModule } from './public/posts-public.module';
import { PostsShareStatsModule } from './posts-share-stats/posts-share-stats.module';
import { RepostsModule } from '../reposts/reposts.module';

@Module({
  imports: [
    PrismaModule,
    PostsPublicModule, 
    PostsShareStatsModule,
    RepostsModule,
    AuthModule, 
    PostsVisibilityModule,
    NotificationsModule, 
    CommentsModule,
  ],
  controllers: [PostsController],
  providers: [
    PostsService,
    PostsRepository,
    PostDeletePolicy,
    PostUpdatePolicy,
    PostUserTagViewPolicy,
    PostAudit,
    PostCreatedEvent,
    PostVisibilityService,
    PostCacheService,
    PostLikePolicy,
    PostUserTagListener,
    PostLikedEvent,
    PostUnlikePolicy,
    PostUserTagCreatePolicy,
    PostUserTagUpdatePolicy,
    PostUserTagRemovePolicy,
    PostUserTagAcceptPolicy,
    PostUserTagRejectPolicy,
    PostUserTagViewPolicy,
  ],
exports: [
    PostVisibilityService,
  ],
})
export class PostsModule {}
