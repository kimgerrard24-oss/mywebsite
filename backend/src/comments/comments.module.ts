// backend/src/comments/comments.module.ts
import { Module } from '@nestjs/common';
import { PostCommentsController } from './comments.controller';
import { CommentsService } from './comments.service';
import { CommentsRepository } from './comments.repository';
import { CommentsPolicy } from './policy/comment.policy';
import { AuthModule } from '../auth/auth.module';
import { CommentReadPolicy } from './policy/comment-read.policy';
import { CommentsController } from './update-delete/comments-controller';

@Module({
  imports: [ AuthModule ],
  controllers: [ PostCommentsController, CommentsController ],
  providers: [
    CommentsService,
    CommentsRepository,
    CommentsPolicy,
    CommentReadPolicy,
  ],
})
export class CommentsModule {}
