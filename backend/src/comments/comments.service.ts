// backend/src/comments/comments.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { CommentsRepository } from './comments.repository';
import { CommentsPolicy } from './policy/comment.policy';
import { CommentDto } from './dto/comment.dto';
import { CommentReadPolicy } from './policy/comment-read.policy';

@Injectable()
export class CommentsService {
  constructor(
    private readonly repo: CommentsRepository,
    private readonly commentpolicy: CommentsPolicy,
    private readonly readpolicy: CommentReadPolicy,
  ) {}

  async createComment(params: {
    postId: string;
    authorId: string;
    content: string;
  }): Promise<CommentDto> {
    const { postId, authorId, content } = params;

    const post = await this.repo.findPostForComment(postId);
    if (!post) {
      throw new NotFoundException('Post not found');
    }

    this.commentpolicy.assertCanComment(post);

    const comment = await this.repo.createComment({
      postId,
      authorId,
      content,
    });

    return CommentDto.fromEntity(comment);
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

    const rows = await this.repo.findComments({
      postId: params.postId,
      limit: params.limit,
      cursor: params.cursor,
    });

    const items = rows.map(CommentDto.fromEntity);

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
