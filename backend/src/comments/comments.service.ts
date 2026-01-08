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
import { parseHashtags } from '../posts/utils/parse-hashtags.util';
import { AuditService } from '../auth/audit.service'

@Injectable()
export class CommentsService {
  constructor(
    private readonly repo: CommentsRepository,
    private readonly commentpolicy: CommentsPolicy,
    private readonly readpolicy: CommentReadPolicy,
    private readonly notifications: NotificationsService,
    private readonly audit: AuditService,
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

  // ==================================================
  // 🔒 LOAD POST + BLOCK ENFORCEMENT (2-way)
  // ==================================================
  const post = await this.repo.findPostForComment({
    postId,
    viewerUserId: authorId,
  });

  if (!post) {
    throw new NotFoundException('Post not found');
  }

  this.commentpolicy.assertCanComment(post);

  // ==================================================
  // 1️⃣ CREATE COMMENT (เดิม)
  // ==================================================
  const created = await this.repo.createComment({
    postId,
    authorId,
    content,
  });

  // ==================================================
  // 🔹 MENTION HANDLING (persist only)
  // ==================================================
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
        await this.repo.createCommentMentions({
          commentId: created.id,
          userIds: uniqueMentions,
        });
      } catch {
        /**
         * ❗ mention persistence fail
         * must not break comment
         */
      }
    }
  }
   // ===============================
// ✅ AUDIT LOG: CREATE COMMENT
// ===============================
try {
  await this.audit.createLog({
    userId: authorId,
    action: 'comment.create',
    success: true,
    targetId: created.id,
    metadata: {
      postId,
      hasMentions: uniqueMentions.length > 0,
    },
  });
} catch {
  // must not affect main flow
}

  // ==================================================
  // 🔔 NOTIFICATION: COMMENT (respect block)
  // ==================================================
  if (post.authorId !== authorId) {
    try {
      const canNotify =
        await this.repo.canNotifyBetweenUsers({
          actorUserId: authorId,
          targetUserId: post.authorId,
        });

      if (canNotify) {
        await this.notifications.createNotification({
          userId: post.authorId,
          actorUserId: authorId,
          type: 'comment',
          entityId: postId,
          payload: {
            postId,
          },
        });
      }
    } catch {
      // ❗ notification fail must not break comment
    }
  }

  // ==================================================
  // 🔔 NOTIFICATION: COMMENT MENTION (respect block)
  // ==================================================
  if (uniqueMentions.length > 0) {
    for (const userId of uniqueMentions) {
      try {
        const canNotify =
          await this.repo.canNotifyBetweenUsers({
            actorUserId: authorId,
            targetUserId: userId,
          });

        if (canNotify) {
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
        }
      } catch {
        /**
         * ❗ mention notification fail
         * must not break comment
         */
      }
    }
  }

  // ==================================================
  // 🔹 HASHTAG HANDLING (เดิม)
  // ==================================================
  try {
    const tags = parseHashtags(content);

    if (tags.length > 0) {
      const tagRows = await this.repo.upsertTags(tags);

      await this.repo.createCommentTags({
        commentId: created.id,
        tagIds: tagRows.map((t) => t.id),
      });
    }
  } catch {
    /**
     * ❗ hashtag persistence fail
     * must not break comment
     */
  }

  // ==================================================
  // 🔒 RE-FETCH WITH BLOCK FILTER (SOURCE OF TRUTH)
  // ==================================================
  const rows = await this.repo.findByPostId({
    postId,
    limit: 1,
    viewerUserId: authorId,
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
    viewerUserId: params.viewerUserId,
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

    // ===============================
// ✅ AUDIT LOG: UPDATE COMMENT
// ===============================
try {
  await this.audit.createLog({
    userId: viewerUserId,
    action: 'comment.update',
    success: true,
    targetId: commentId,
  });
} catch {}

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
  }) {
    const { commentId, viewerUserId } = params;

    const comment = await this.repo.findById(commentId);

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    CommentDeletePolicy.assertCanDelete({
      viewerUserId,
      authorId: comment.authorId,
    });

    await this.repo.deleteById(commentId);

    // ===============================
// ✅ AUDIT LOG: DELETE COMMENT
// ===============================
try {
  await this.audit.createLog({
    userId: viewerUserId,
    action: 'comment.delete',
    success: true,
    targetId: commentId,
  });
} catch {}
  }

  
}
