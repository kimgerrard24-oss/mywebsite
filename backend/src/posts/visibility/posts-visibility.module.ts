// backend/src/posts/visibility/posts-visibility.module.ts

import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { AuthModule } from '../../auth/auth.module';
import { PostsVisibilityController } from './posts-visibility.controller';
import { PostsVisibilityService } from './posts-visibility.service';
import { PostsVisibilityRepository } from './posts-visibility.repository';

@Module({
  imports: [PrismaModule, AuthModule ],
  controllers: [PostsVisibilityController],
  providers: [
    PostsVisibilityService,
    PostsVisibilityRepository,
  ],
  exports: [PostsVisibilityService],
})
export class PostsVisibilityModule {}
