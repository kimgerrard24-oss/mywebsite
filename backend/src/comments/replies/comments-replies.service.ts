// backend/src/comments/replies/comments-replies.service.ts

import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CommentsRepliesRepository } from './comments-replies.repository';
import { CommentReplyPolicy } from './policy/comment-reply.policy';
import { CommentMapper } from '../mappers/comment.mapper';

@Injectable()
export class CommentsRepliesService {
  constructor(
    private readonly repo: CommentsRepliesRepository,
  ) {}

  async createReply(params: {
    parentCommentId: string;
    authorId: string;
    content: string;
  }) {
    const { parentCommentId, authorId, content } =
      params;

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
     * 🔒 Enforce 1-level reply only (STATIC POLICY)
     */
    CommentReplyPolicy.assertCanReply(parent);

    await this.repo.createReply({
      postId: parent.postId,
      parentCommentId,
      authorId,
      content,
    });

    /**
     * 🔒 Re-fetch with author relation (source of truth)
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
