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

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [PostsController],
  providers: [
    PostsService,
    PostsRepository,
    PostDeletePolicy,
    PostUpdatePolicy,
    PostAudit,
    PostCreatedEvent,
    PostVisibilityService,
    PostCacheService,
    PostLikePolicy,
    PostLikedEvent,
    PostUnlikePolicy,
  ],
})
export class PostsModule {}
