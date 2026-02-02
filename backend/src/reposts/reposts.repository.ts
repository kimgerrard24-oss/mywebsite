// backend/src/reposts/reposts.repository.ts

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Repost } from '@prisma/client';
import { Prisma } from '@prisma/client';

type RepostRow = Prisma.RepostGetPayload<{
  select: {
    id: true;
    createdAt: true;
    actor: {
      select: {
        id: true;
        displayName: true;
        avatarUrl: true;
      };
    };
  };
}>;


@Injectable()
export class RepostsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findExistingRepost(params: {
    actorUserId: string;
    postId: string;
  }): Promise<Repost | null> {
    return this.prisma.repost.findFirst({
      where: {
        actorUserId: params.actorUserId,
        originalPostId: params.postId,
        deletedAt: null,
      },
    });
  }

  async createRepost(params: {
  actorUserId: string;
  postId: string;
}): Promise<{
  id: string;
  originalPostId: string;
  createdAt: Date;
  originalPostAuthorId: string;
}> {
  const repost = await this.prisma.repost.create({
    data: {
      actorUserId: params.actorUserId,
      originalPostId: params.postId,
    },
    select: {
      id: true,
      originalPostId: true,
      createdAt: true,
      originalPost: {
        select: {
          authorId: true,
        },
      },
    },
  });

  return {
    id: repost.id,
    originalPostId: repost.originalPostId,
    createdAt: repost.createdAt,
    originalPostAuthorId: repost.originalPost.authorId,
  };
}


  async incrementRepostCount(postId: string): Promise<void> {
    await this.prisma.post.update({
      where: { id: postId },
      data: {
        repostCount: { increment: 1 },
      },
    });
  }

  async findActiveRepost(params: {
    actorUserId: string;
    postId: string;
  }): Promise<Repost | null> {
    return this.prisma.repost.findFirst({
      where: {
        actorUserId: params.actorUserId,
        originalPostId: params.postId,
        deletedAt: null,
      },
    });
  }

  async softDeleteRepost(repostId: string): Promise<void> {
    await this.prisma.repost.update({
      where: { id: repostId },
      data: {
        deletedAt: new Date(),
      },
    });
  }

  async decrementRepostCount(postId: string): Promise<void> {
    await this.prisma.post.update({
      where: { id: postId },
      data: {
        repostCount: {
          decrement: 1,
        },
      },
    });
  }

async findRepostsByPostId(params: {
  postId: string;
  viewerUserId: string;
  limit: number;
  cursor?: string;
}): Promise<{
  rows: Array<{
    id: string;
    createdAt: Date;
    user: {
      id: string;
      displayName: string | null;
      avatarUrl: string | null;
    };
  }>;
  nextCursor: string | null;
}> {
  const { postId, viewerUserId, limit, cursor } = params;

  const rows = await this.prisma.repost.findMany({
    where: {
      originalPostId: postId,
      deletedAt: null,

      // 🔐 block enforcement (viewer ↔ reposter)
      actor: {
        AND: [
          {
            blockedBy: {
              none: { blockerId: viewerUserId },
            },
          },
          {
            blockedUsers: {
              none: { blockedId: viewerUserId },
            },
          },
        ],
      },
    },

    take: limit + 1,

    ...(cursor && {
      skip: 1,
      cursor: { id: cursor },
    }),

    orderBy: { createdAt: 'desc' },

    select: {
      id: true,
      createdAt: true,
      actor: {
        select: {
          id: true,
          displayName: true,
          avatarUrl: true,
        },
      },
    },
  });

  let nextCursor: string | null = null;

  if (rows.length > limit) {
    const next = rows.pop();
    nextCursor = next!.id;
  }

  return {
    rows: rows.map((r) => ({
      id: r.id,
      createdAt: r.createdAt,
      user: {
        id: r.actor.id,
        displayName: r.actor.displayName,
        avatarUrl: r.actor.avatarUrl,
      },
    })),
    nextCursor,
  };
}


  async hasReposted(params: {
  postId: string;
  actorUserId: string;
}): Promise<boolean> {
  const count = await this.prisma.repost.count({
    where: {
      originalPostId: params.postId,
      actorUserId: params.actorUserId,
      deletedAt: null,
    },
  });
  return count > 0;
}
}

