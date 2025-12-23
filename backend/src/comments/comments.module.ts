// backend/src/comments/comments.module.ts
import { Module } from '@nestjs/common';
import { CommentsController } from './comments.controller';
import { CommentsService } from './comments.service';
import { CommentsRepository } from './comments.repository';
import { CommentsPolicy } from './policy/comment.policy';
import { AuthModule } from '../auth/auth.module';
import { CommentReadPolicy } from './policy/comment-read.policy';

@Module({
  imports: [ AuthModule ],
  controllers: [CommentsController],
  providers: [
    CommentsService,
    CommentsRepository,
    CommentsPolicy,
    CommentReadPolicy,
  ],
})
export class CommentsModule {}
