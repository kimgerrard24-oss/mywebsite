// backend/src/posts/posts.module.ts
import { Module } from '@nestjs/common';
import { PostsController } from './posts.controller';
import { PostsService } from './posts.service';
import { PostsRepository } from './posts.repository';
import { PostAudit } from './audit/post.audit';
import { PostCreatedEvent } from './events/post-created.event';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [PostsController],
  providers: [
    PostsService,
    PostsRepository,
    PostAudit,
    PostCreatedEvent,
  ],
})
export class PostsModule {}
