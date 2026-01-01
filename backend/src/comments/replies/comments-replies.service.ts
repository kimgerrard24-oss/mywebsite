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
@Injectable()
export class CommentsRepliesService {
  private readonly logger = new Logger(
    CommentsRepliesService.name,
  );

  constructor(
    private readonly repo: CommentsRepliesRepository,
    private readonly readPolicy: CommentReadPolicy,
  ) {}


 async createReply(params: {
  parentCommentId: string;
  authorId: string;
  content: string;
 }) {
  const { parentCommentId, authorId, content } = params;

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
   * (CRITICAL FIX)
   */
  const post =
    await this.repo.findReadablePostByParentComment(
      parentCommentId,
    );

  if (!post) {
    /**
     * 🔒 ไม่สามารถอ่านโพสต์นี้ได้
     * (hidden / deleted / unpublished / no permission)
     */
    throw new NotFoundException('Post not found');
    // หรือ ForbiddenException ก็ได้ ขึ้นกับ policy ของคุณ
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
   * 5️⃣ Create reply
   */
  await this.repo.createReply({
    postId: parent.postId,
    parentCommentId,
    authorId,
    content,
  });

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
