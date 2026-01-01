// backend/src/comments/likes/comments-likes.service.ts

import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

type ToggleLikeParams = {
  commentId: string;
  userId: string;
};

@Injectable()
export class CommentsLikesService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async toggleLike(params: ToggleLikeParams) {
    const { commentId, userId } = params;

    // Ensure comment exists (fail fast)
    const commentExists =
      await this.prisma.comment.findUnique({
        where: { id: commentId },
        select: { id: true },
      });

    if (!commentExists) {
      throw new NotFoundException(
        'Comment not found',
      );
    }

    // Check existing like
    const existingLike =
      await this.prisma.commentLike.findUnique({
        where: {
          commentId_userId: {
            commentId,
            userId,
          },
        },
      });

    let liked: boolean;

    if (existingLike) {
      // Unlike
      await this.prisma.commentLike.delete({
        where: {
          commentId_userId: {
            commentId,
            userId,
          },
        },
      });
      liked = false;
    } else {
      // Like
      await this.prisma.commentLike.create({
        data: {
          commentId,
          userId,
        },
      });
      liked = true;
    }

    const likeCount =
      await this.prisma.commentLike.count({
        where: { commentId },
      });

    return {
      liked,
      likeCount,
    };
  }
}
