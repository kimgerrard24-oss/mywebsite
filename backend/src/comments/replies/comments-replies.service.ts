// backend/src/comments/replies/comments-replies.service.ts

import {
  Injectable,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { CommentsRepliesRepository } from './comments-replies.repository';
import { CommentReplyPolicy } from './policy/comment-reply.policy';
import { CommentMapper } from '../mappers/comment.mapper';
import { CommentReadPolicy } from '../policy/comment-read.policy'
import { NotificationsService } from '../../notifications/notifications.service';
import { parseHashtags } from '../../posts/utils/parse-hashtags.util';

@Injectable()
export class CommentsRepliesService {
  private readonly logger = new Logger(
    CommentsRepliesService.name,
  );

  constructor(
    private readonly repo: CommentsRepliesRepository,
    private readonly readPolicy: CommentReadPolicy,
    private readonly notifications: NotificationsService,
  ) {}


async createReply(params: {
  parentCommentId: string;
  authorId: string;
  content: string;
  mentions?: string[]; // 🔹 NEW (optional)
}) {
  const {
    parentCommentId,
    authorId,
    content,
    mentions = [], // 🔹 NEW
  } = params;

  /**
   * 1️⃣ Find parent comment
   */
  const parent =
    await this.repo.findParentComment(parentCommentId);

  /**
   * 🔒 Parent must exist & must not be deleted
   */
  if (!parent || parent.isDeleted) {
    throw new NotFoundException(
      'Parent comment not found',
    );
  }

  /**
   * 2️⃣ 🔒 CHECK: viewer must be able to read the post
   */
  const post =
    await this.repo.findReadablePostByParentComment(
      parentCommentId,
    );

  if (!post) {
    throw new NotFoundException('Post not found');
  }

  this.readPolicy.assertCanRead(post);

  /**
   * 3️⃣ 🔎 Audit log (NO behavior change)
   */
  if (parent.parentId !== null) {
    this.logger.warn(
      `Reply blocked (nested): parent=${parent.id} parentId=${parent.parentId} author=${authorId}`,
    );
  }

  /**
   * 4️⃣ 🔒 Enforce 1-level reply only
   */
  CommentReplyPolicy.assertCanReply(parent);

  /**
   * 5️⃣ Create reply (authority = DB)
   */
  const created = await this.repo.createReply({
    postId: parent.postId,
    parentCommentId,
    authorId,
    content,
  });

  /**
   * =========================
   * 🔹 MENTION HANDLING (NEW)
   * =========================
   * - fail-soft
   * - no self mention
   * - dedupe
   */
  if (mentions.length > 0) {
    const uniqueMentions = Array.from(
      new Set(
        mentions.filter(
          (userId) =>
            Boolean(userId) && userId !== authorId,
        ),
      ),
    );

    if (uniqueMentions.length > 0) {
      try {
        /**
         * Persist reply mentions
         * (table: reply_mentions
         *  or shared comment_mentions)
         */
        await this.repo.createReplyMentions({
          replyId: created.id,
          userIds: uniqueMentions,
        });

        /**
         * 🔔 Fire notification (fail-soft)
         */
        for (const userId of uniqueMentions) {
          try {
            await this.notifications.createNotification({
              userId,
              actorUserId: authorId,
              type: 'comment_mention',
              entityId: created.id,
              payload: {
                postId: parent.postId,
                commentId: created.id,
              },
            });
          } catch {
            // ❗ notification fail ต้องไม่ทำให้ reply fail
          }
        }
      } catch {
        /**
         * ❗ mention fail ต้องไม่ทำให้ reply fail
         */
      }
    }
  }

  // =========================
// 🔹 HASHTAG HANDLING (NEW)
// =========================
try {
  const tags = parseHashtags(content);

  if (tags.length > 0) {
    const tagRows = await this.repo.upsertTags(tags);

    await this.repo.createCommentTags({
      commentId: created.id, // reply = comment with parentId
      tagIds: tagRows.map((t) => t.id),
    });
  }
} catch {
  /**
   * ❗ hashtag persistence fail
   * ต้องไม่ทำให้ reply fail
   */
}


  /**
   * 6️⃣ Re-fetch with author relation (source of truth)
   */
  const rows = await this.repo.findReplies({
    parentCommentId,
    limit: 1,
  });

  const [item] = CommentMapper.toItemDtos(
    rows,
    authorId,
  );

  return item;
 }


  async getReplies(params: {
    parentCommentId: string;
    viewerUserId: string | null;
    limit: number;
    cursor?: string;
  }) {
    const parent =
      await this.repo.findParentComment(
        params.parentCommentId,
      );

    /**
     * 🔒 Parent must exist & must not be deleted
     */
    if (!parent || parent.isDeleted) {
      throw new NotFoundException(
        'Parent comment not found',
      );
    }

    const rows = await this.repo.findReplies({
      parentCommentId: params.parentCommentId,
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
}
