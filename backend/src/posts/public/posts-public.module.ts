// backend/src/posts/public/posts-public.module.ts

import { Module } from '@nestjs/common';

import { PostsPublicController } from './posts-public.controller';
import { PostsPublicService } from './posts-public.service';
import { PostsPublicRepository } from './posts-public.repository';
import { AuthModule } from '../../auth/auth.module';
import { PrismaModule } from '../../prisma/prisma.module';
import { PostsRepository } from '../posts.repository';

import { PostsVisibilityService } from '../visibility/posts-visibility.service';
import { PostsVisibilityRepository } from '../visibility/posts-visibility.repository';
import { PostsPublicShareService } from './posts-public-share.service';
import { PostsPublicShareController } from './posts-public-share.controller';

@Module({
  imports: [
      AuthModule,
      PrismaModule,
    ],
  controllers: [PostsPublicController,PostsPublicShareController],
  providers: [
    PostsPublicService,
    PostsPublicShareService,
    PostsPublicRepository,
    PostsRepository,
    PostsVisibilityService,
    PostsVisibilityRepository,
  ],
})
export class PostsPublicModule {}
