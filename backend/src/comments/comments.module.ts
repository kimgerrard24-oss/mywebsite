// backend/src/comments/comments.module.ts
import { Module } from '@nestjs/common';
import { PostCommentsController } from './comments.controller';
import { CommentsService } from './comments.service';
import { CommentsRepository } from './comments.repository';
import { CommentsPolicy } from './policy/comment.policy';
import { AuthModule } from '../auth/auth.module';
import { CommentReadPolicy } from './policy/comment-read.policy';
import { CommentsController } from './update-delete/comments-controller';
import { NotificationsModule } from '../notifications/notifications.module';
import { CommentsRepliesController } from './replies/comments-replies.controller';
import { CommentsRepliesService } from './replies/comments-replies.service';
import { CommentsRepliesRepository } from './replies/comments-replies.repository';
import { CommentReplyPolicy } from './replies/policy/comment-reply.policy';
import { CommentsLikesController } from './likes/comments-likes.controller';
import { CommentsLikesService } from './likes/comments-likes.service';

@Module({
  imports: [ AuthModule, NotificationsModule],
  controllers: [ PostCommentsController, CommentsLikesController, CommentsController, CommentsRepliesController ],
  providers: [
    CommentsService,
    CommentsRepository,
    CommentsPolicy,
    CommentReadPolicy,
    CommentsLikesService,
    CommentsRepliesService,
    CommentsRepliesRepository,
    CommentReplyPolicy,
  ],
})
export class CommentsModule {}
