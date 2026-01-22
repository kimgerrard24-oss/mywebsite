// backend/src/posts/visibility/repositories/posts-visibility.repository.ts

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class PostsVisibilityRepository {
  constructor(private readonly prisma: PrismaService) {}

  async loadPostVisibilityContext(params: {
    postId: string;
    viewerUserId: string | null;
  }) {
    const { postId, viewerUserId } = params;

    const post = await this.prisma.post.findUnique({
      where: { id: postId },
      select: {
        id: true,
        authorId: true,
        isDeleted: true,
        isHidden: true,
        author: {
          select: {
            isPrivate: true,
          },
        },
      },
    });

    if (!post) {
      return { post: null, isFollower: false, isBlockedEitherWay: false };
    }

    let isFollower = false;
    let isBlockedEitherWay = false;

    if (viewerUserId) {
      const [follow, block] = await Promise.all([
        this.prisma.follow.findFirst({
          where: {
            followerId: viewerUserId,
            followingId: post.authorId,
          },
          select: { followerId: true },
        }),

        this.prisma.userBlock.findFirst({
          where: {
            OR: [
              { blockerId: viewerUserId, blockedId: post.authorId },
              { blockerId: post.authorId, blockedId: viewerUserId },
            ],
          },
          select: { blockerId: true },
        }),
      ]);

      isFollower = Boolean(follow);
      isBlockedEitherWay = Boolean(block);
    }

    return {
      post,
      isFollower,
      isBlockedEitherWay,
    };
  }
}
