// backend/src/posts/public/posts-public.module.ts

import { Module } from '@nestjs/common';

import { PostsPublicController } from './posts-public.controller';
import { PostsPublicService } from './posts-public.service';

import { PostsPublicShareController } from './posts-public-share.controller';
import { PostsPublicShareService } from './posts-public-share.service';

import { PostsRepository } from '../posts.repository';

import { AuthModule } from '../../auth/auth.module';
import { PrismaModule } from '../../prisma/prisma.module';

import { PostsVisibilityService } from '../visibility/posts-visibility.service';
import { PostsVisibilityRepository } from '../visibility/posts-visibility.repository';

@Module({
  imports: [
    // ยังจำเป็นสำหรับ OptionalAuthGuard (user-facing route)
    AuthModule,

    // Prisma client
    PrismaModule,
  ],
  controllers: [
    // user-facing public post
    PostsPublicController,

    // external share / SEO / OG
    PostsPublicShareController,
  ],
  providers: [
    // user-facing
    PostsPublicService,

    // external share
    PostsPublicShareService,

    // shared repository
    PostsRepository,

    // visibility authority (ใช้เฉพาะ user-facing)
    PostsVisibilityService,
    PostsVisibilityRepository,
  ],
})
export class PostsPublicModule {}
