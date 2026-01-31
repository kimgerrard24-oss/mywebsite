// backend/src/shares/shares-external.repository.ts

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  PostVisibility,
  VisibilityRuleType,
} from '@prisma/client';

@Injectable()
export class SharesExternalRepository {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async loadContext(params: {
    postId: string;
    actorUserId: string;
  }) {
    const { postId, actorUserId } = params;

    const post = await this.prisma.post.findUnique({
      where: { id: postId },
      select: {
        id: true,
        authorId: true,
        isDeleted: true,
        isHidden: true,
        visibility: true,
        author: {
          select: {
            id: true,
            isPrivate: true,
          },
        },
        visibilityRules: {
          where: { userId: actorUserId },
          select: { rule: true },
          take: 1,
        },
      },
    });

    if (!post) {
      return { post: null as any };
    }

    const [block1, block2, follow] =
      await Promise.all([
        this.prisma.userBlock.findFirst({
          where: {
            blockerId: actorUserId,
            blockedId: post.authorId,
          },
          select: { blockerId: true },
        }),
        this.prisma.userBlock.findFirst({
          where: {
            blockerId: post.authorId,
            blockedId: actorUserId,
          },
          select: { blockerId: true },
        }),
        this.prisma.follow.findFirst({
          where: {
            followerId: actorUserId,
            followingId: post.authorId,
          },
          select: { followerId: true },
        }),
      ]);

    return {
      post,
      isOwner: post.authorId === actorUserId,
      isFollower: !!follow,
      isBlockedEitherWay: !!block1 || !!block2,
      visibilityRule:
        post.visibilityRules[0]?.rule ?? null,
      isAuthorPrivate: post.author.isPrivate,
    };
  }

  async createShareLink(params: {
    postId: string;
    creatorUserId: string;
    code: string;
  }) {
    return this.prisma.shareLink.create({
  data: {
    postId: params.postId,
    creatorId: params.creatorUserId,
    code: params.code,
  },
  select: {
    id: true,
    code: true,
    createdAt: true,
  },
});

  }

  async findExistingLink(params: {
  postId: string;
  creatorUserId: string;
}) {
  return this.prisma.shareLink.findUnique({
    where: {
      postId_creatorId: {
        postId: params.postId,
        creatorId: params.creatorUserId,
      },
    },
    select: {
      id: true,
      code: true,
      createdAt: true,
    },
  });
}

async incrementExternalShareCount(params: { postId: string }) {
  await this.prisma.postShareStat.upsert({
    where: { postId: params.postId },
    update: {
      externalShareCount: { increment: 1 },
      lastSharedAt: new Date(),
    },
    create: {
      postId: params.postId,
      internalShareCount: 0,
      externalShareCount: 1,
      lastSharedAt: new Date(),
    },
  });
}

}
