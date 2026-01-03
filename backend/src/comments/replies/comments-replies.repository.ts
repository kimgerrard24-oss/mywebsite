// backend/src/comments/replies/comments-replies.repository.ts

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma } from '@prisma/client';

type ParentCommentForReply = Prisma.CommentGetPayload<{
  select: {
    id: true;
    postId: true;
    parentId: true;
    authorId: true;
    isDeleted: true;
  };
}>;

@Injectable()
export class CommentsRepliesRepository {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  /**
   * =====================================================
   * Find parent comment for reply
   * - ใช้ Prisma-generated type (source of truth)
   * =====================================================
   */
  async findParentComment(
    commentId: string,
  ): Promise<ParentCommentForReply | null> {
    return this.prisma.comment.findFirst({
      where: {
        id: commentId,
      },
      select: {
        id: true,
        postId: true,
        parentId: true,
        authorId: true,
        isDeleted: true,
      },
    });
    
  }

  async createReply(params: {
    postId: string;
    parentCommentId: string;
    authorId: string;
    content: string;
  }) {
    return this.prisma.comment.create({
      data: {
        postId: params.postId,
        parentId: params.parentCommentId,
        authorId: params.authorId,
        content: params.content,
      },
    });
  }

  async findReplies(params: {
    parentCommentId: string;
    limit: number;
    cursor?: string;
  }) {
    return this.prisma.comment.findMany({
      where: {
        parentId: params.parentCommentId,
        isDeleted: false,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: params.limit,
      ...(params.cursor && {
        skip: 1,
        cursor: { id: params.cursor },
      }),
      include: {
        author: {
          select: {
            id: true,
            displayName: true,
            avatarUrl: true,
          },
        },
      },
    });
  }

  async findReadablePostByParentComment(
  parentCommentId: string,
) {
  return this.prisma.post.findFirst({
    where: {
      comments: {
        some: {
          id: parentCommentId,
          isDeleted: false,
        },
      },
      isDeleted: false,
      isHidden: false,
      isPublished: true,
    },
    select: { id: true },
  });
 }

 async createReplyMentions(params: {
  replyId: string;
  userIds: string[];
}) {
  if (params.userIds.length === 0) return;

  await this.prisma.commentMention.createMany({
    data: params.userIds.map((userId) => ({
      commentId: params.replyId, // ✅ reply คือ comment
      userId,
    })),
    skipDuplicates: true, // ✅ safety net
  });
}



}
