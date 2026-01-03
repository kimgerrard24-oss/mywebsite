// backend/src/comments/comments.service.ts
import {  
  Injectable, 
  NotFoundException } from '@nestjs/common';
import { CommentsRepository } from './comments.repository';
import { CommentsPolicy } from './policy/comment.policy';
import { CommentDto } from './dto/comment.dto';
import { CommentReadPolicy } from './policy/comment-read.policy';
import { CommentDeletePolicy } from './policy/comment-delete.policy';
import { CommentUpdatePolicy } from './policy/comment-update.policy';
import { CommentMapper } from './mappers/comment.mapper';
import { CommentItemDto } from './dto/comment-item.dto';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationMapper } from '../notifications/mapper/notification.mapper';

@Injectable()
export class CommentsService {
  constructor(
    private readonly repo: CommentsRepository,
    private readonly commentpolicy: CommentsPolicy,
    private readonly readpolicy: CommentReadPolicy,
    private readonly notifications: NotificationsService,
  ) {}

async createComment(params: {
  postId: string;
  authorId: string;
  content: string;
  mentions?: string[];
}): Promise<CommentItemDto> {
  const {
    postId,
    authorId,
    content,
    mentions = [],
  } = params;

  const post = await this.repo.findPostForComment(postId);
  if (!post) {
    throw new NotFoundException('Post not found');
  }

  this.commentpolicy.assertCanComment(post);

  // 1️⃣ Create comment (เดิม)
  const created = await this.repo.createComment({
    postId,
    authorId,
    content,
  });

  // =========================
  // 🔹 MENTION HANDLING
  // =========================
  let uniqueMentions: string[] = [];

  if (mentions.length > 0) {
    /**
     * Normalize mentions
     * - dedupe
     * - ignore self mention
     * - ignore empty values
     */
    uniqueMentions = Array.from(
      new Set(
        mentions.filter(
          (userId) =>
            Boolean(userId) && userId !== authorId,
        ),
      ),
    );

    if (uniqueMentions.length > 0) {
      try {
        // persist mention relation (เดิม)
        await this.repo.createCommentMentions({
          commentId: created.id,
          userIds: uniqueMentions,
        });
      } catch {
        /**
         * ❗ mention persistence fail
         * ต้องไม่ทำให้ comment fail
         */
      }
    }
  }

  // =========================
  // 🔔 NOTIFICATION: COMMENT (เดิม)
  // =========================
  if (post.authorId !== authorId) {
    try {
      await this.notifications.createNotification({
        userId: post.authorId,
        actorUserId: authorId,
        type: 'comment',
        entityId: postId,
        payload: {
          postId,
        },
      });
    } catch {
      // ❗ notification fail ต้องไม่ทำให้ comment fail
    }
  }

  // =========================
  // 🔔 NOTIFICATION: COMMENT MENTION (NEW)
  // =========================
  if (uniqueMentions.length > 0) {
    for (const userId of uniqueMentions) {
      try {
        await this.notifications.createNotification({
          userId,
          actorUserId: authorId,
          type: 'comment_mention',
          entityId: created.id,
          payload: {
            postId,
            commentId: created.id,
          },
        });
      } catch {
        /**
         * ❗ mention notification fail
         * ต้องไม่ทำให้ comment fail
         */
      }
    }
  }

  // =========================
  // 🔒 re-fetch with author (source of truth)
  // =========================
  const rows = await this.repo.findByPostId({
    postId,
    limit: 1,
  });

  const [item] = CommentMapper.toItemDtos(
    rows,
    authorId,
  );

  return item;
}


 async getPostComments(params: {
  postId: string;
  viewerUserId: string | null;
  limit: number;
  cursor?: string;
}) {
  const post = await this.repo.findReadablePost(params.postId);
  if (!post) {
    throw new NotFoundException('Post not found');
  }

  this.readpolicy.assertCanRead(post);

  // ✅ ใช้ method ที่ include author + filter isDeleted
  const rows = await this.repo.findByPostId({
    postId: params.postId,
    limit: params.limit,
    cursor: params.cursor,
  });

  const items = CommentMapper.toItemDtos(
    rows,
    params.viewerUserId,
  );

  const nextCursor =
    rows.length === params.limit
      ? rows[rows.length - 1].id
      : null;

  return {
    items,
    nextCursor,
  };
}


   async updateComment(params: {
    commentId: string;
    content: string;
    viewerUserId: string;
  }) {
    const { commentId, content, viewerUserId } = params;

    const comment = await this.repo.findById(commentId);

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    CommentUpdatePolicy.assertCanUpdate({
      viewerUserId,
      authorId: comment.authorId,
    });

    const updated = await this.repo.updateContent({
      commentId,
      content,
    });

    return {
      id: updated.id,
      content: updated.content,
      isEdited: true,
      editedAt: updated.editedAt,
    };
  }

  async deleteComment(params: {
  commentId: string;
  viewerUserId: string;
  viewerRole?: 'ADMIN' | 'USER';
}) {
  const { commentId, viewerUserId, viewerRole } = params;

  const comment = await this.repo.findById(commentId);

  if (!comment) {
    throw new NotFoundException('Comment not found');
  }

  CommentDeletePolicy.assertCanDelete({
    viewerUserId,
    authorId: comment.authorId,
    viewerRole,
  });

  await this.repo.deleteById(commentId);
}

}
