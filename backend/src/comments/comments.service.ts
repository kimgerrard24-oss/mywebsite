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
import { parseHashtags } from '../posts/utils/parse-hashtags.util';
import { AuditService } from '../auth/audit.service'
import { PostsVisibilityService } from '../posts/visibility/posts-visibility.service';

@Injectable()
export class CommentsService {
  constructor(
    private readonly repo: CommentsRepository,
    private readonly commentpolicy: CommentsPolicy,
    private readonly readpolicy: CommentReadPolicy,
    private readonly notifications: NotificationsService,
    private readonly audit: AuditService,
    private readonly postVisibility: PostsVisibilityService,
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
  // 🔒 LOAD POST + BLOCK ENFORCEMENT (repo pre-filter)
  // ==================================================
  const post = await this.repo.findPostForComment({
    postId,
    viewerUserId: authorId,
  });

  if (!post) {
    // production behavior: do not reveal existence
    throw new NotFoundException('Post not found');
  }

  // ==================================================
  // 🔒 HARD STATE GUARD (deleted / hidden)
  // ==================================================
  if (post.isHidden === true || post.isDeleted === true) {
    throw new NotFoundException('Post not found');
  }

  // ==================================================
  // 🔐 FINAL AUTHORITY: POST VISIBILITY
  // ==================================================
  const decision = await this.postVisibility.validateVisibility({
  postId,
  viewerUserId: authorId,
});

if (!decision.canView) {
  throw new NotFoundException('Post not found');
}


  // ==================================================
  // 🔐 BUSINESS POLICY (unchanged)
  // ==================================================
  this.commentpolicy.assertCanComment(post);

  // ==================================================
  // 1️⃣ CREATE COMMENT
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
  const { postId, viewerUserId, limit, cursor } = params;

  // ==================================================
  // 🔒 LOAD POST (repo pre-filter)
  // ==================================================
  const post = await this.repo.findReadablePost(postId);

  if (!post) {
    // production behavior: do not reveal existence
    throw new NotFoundException('Post not found');
  }

  // ==================================================
  // 🔒 HARD STATE GUARD (deleted / hidden)
  // ==================================================
  if (post.isHidden === true || post.isDeleted === true) {
    throw new NotFoundException('Post not found');
  }

  // ==================================================
  // 🔐 FINAL AUTHORITY: POST VISIBILITY
  // ==================================================
  const decision = await this.postVisibility.validateVisibility({
  postId,
  viewerUserId,
});

if (!decision.canView) {
  throw new NotFoundException('Post not found');
}


  // ==================================================
  // 🔐 BUSINESS READ POLICY (unchanged)
  // ==================================================
  this.readpolicy.assertCanRead(post);

  // ==================================================
  // 1️⃣ LOAD COMMENTS (repo handles block filter)
  // ==================================================
  const rows = await this.repo.findByPostId({
    postId,
    limit,
    cursor,
    viewerUserId,
  });

  const baseItems = CommentMapper.toItemDtos(
    rows,
    viewerUserId,
  );

  /**
   * ===== canAppeal (UX guard only) =====
   * backend remains authority in POST /appeals
   */
  const items = baseItems.map((item, idx) => {
    const row = rows[idx];

    const isOwner =
      !!viewerUserId && row.authorId === viewerUserId;

    const hasActiveModeration =
      row.isHidden === true || row.isDeleted === true;

    return {
      ...item,
      canAppeal: Boolean(isOwner && hasActiveModeration),
    };
  });

  const nextCursor =
    rows.length === limit
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

  /**
   * 🔒 Load comment with postId (authority)
   */
  const comment = await this.repo.findByIdWithPost(
    commentId,
  );

  if (!comment) {
    throw new NotFoundException('Comment not found');
  }

  CommentDeletePolicy.assertCanDelete({
    viewerUserId,
    authorId: comment.authorId,
  });

  /**
   * ✅ Soft delete + decrement post.commentCount (atomic)
   */
  await this.repo.softDeleteAndDecrement({
    commentId: comment.id,
    postId: comment.postId,
  });

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
  } catch {
    // must not affect main flow
  }
}


  
}
