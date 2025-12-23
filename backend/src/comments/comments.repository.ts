// backend/src/comments/comments.repository.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CommentsRepository {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async findPostForComment(postId: string) {
    return this.prisma.post.findFirst({
      where: {
        id: postId,
        isDeleted: false,
        isHidden: false,
        isPublished: true,
      },
      select: {
        id: true,
      },
    });
  }

  async createComment(params: {
    postId: string;
    authorId: string;
    content: string;
  }) {
    const { postId, authorId, content } = params;

    return this.prisma.$transaction(async (tx) => {
      const comment = await tx.comment.create({
        data: {
          postId,
          authorId,
          content,
        },
      });

      await tx.post.update({
        where: { id: postId },
        data: {
          commentCount: { increment: 1 },
        },
      });

      return comment;
    });
  }

  async findReadablePost(postId: string) {
    return this.prisma.post.findFirst({
      where: {
        id: postId,
        isDeleted: false,
        isHidden: false,
        isPublished: true,
      },
      select: { id: true },
    });
  }

  async findComments(params: {
    postId: string;
    limit: number;
    cursor?: string;
  }) {
    const { postId, limit, cursor } = params;

    return this.prisma.comment.findMany({
      where: { postId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      ...(cursor
        ? {
            skip: 1,
            cursor: { id: cursor },
          }
        : {}),
    });
  }
}
