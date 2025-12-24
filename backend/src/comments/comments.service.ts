// backend/src/comments/comments.service.ts
import { 
  ForbiddenException, 
  Injectable, 
  NotFoundException } from '@nestjs/common';
import { CommentsRepository } from './comments.repository';
import { CommentsPolicy } from './policy/comment.policy';
import { CommentDto } from './dto/comment.dto';
import { CommentReadPolicy } from './policy/comment-read.policy';
import { CommentDeletePolicy } from './policy/comment-delete.policy';
import { CommentUpdatePolicy } from './policy/comment-update.policy';
import { CommentMapper } from './mappers/comment.mapper';

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

  const items = rows.map((comment) =>
    CommentMapper.toItemDto(
      comment,
      params.viewerUserId,
    ),
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
  }
}
