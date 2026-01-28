// backend/src/posts/public/posts-public.module.ts

import { Module } from '@nestjs/common';

import { PostsPublicController } from './posts-public.controller';
import { PostsPublicService } from './posts-public.service';
import { PostsPublicRepository } from './posts-public.repository';
import { AuthModule } from '../../auth/auth.module';
import { PrismaModule } from '../../prisma/prisma.module';

import { PostsVisibilityService } from '../visibility/posts-visibility.service';
import { PostsVisibilityRepository } from '../visibility/posts-visibility.repository';

@Module({
  imports: [
      AuthModule,
      PrismaModule,
    ],
  controllers: [PostsPublicController],
  providers: [
    PostsPublicService,
    PostsPublicRepository,

    // visibility authority
    PostsVisibilityService,
    PostsVisibilityRepository,
  ],
})
export class PostsPublicModule {}
