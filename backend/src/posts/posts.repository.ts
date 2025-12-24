// backend/src/posts/posts.repository.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PostsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(params: {
    authorId: string;
    content: string;
  }) {
    return this.prisma.post.create({
      data: {
        authorId: params.authorId,
        content: params.content,
      },
      select: {
        id: true,
        authorId: true,
        createdAt: true,
      },
    });
  }

 async findPublicFeed(params: {
  limit?: number;
  cursor?: string;
  viewerUserId: string | null;

  mediaType?: 'video';
}) {
  const limit = params.limit ?? 20;

  return this.prisma.post.findMany({
    take: limit,

    ...(params.cursor && {
      skip: 1,
      cursor: { id: params.cursor },
    }),

    orderBy: {
      createdAt: 'desc',
    },

    where: {
      visibility: 'PUBLIC',
      isDeleted: false,
      isHidden: false,

      ...(params.mediaType === 'video'
        ? {
            media: {
              some: {
                media: {
                  mediaType: 'VIDEO',
                },
              },
            },
          }
        : {}),
    },

    select: {
      id: true,
      content: true,
      createdAt: true,
      likeCount: true,
      commentCount: true,

      author: {
        select: {
          id: true,
          displayName: true,
          avatarUrl: true,
        },
      },

      media: {
        select: {
          media: {
            select: {
              id: true,
              mediaType: true,
              objectKey: true,
              width: true,
              height: true,
              duration: true,
            },
          },
        },
      },
    },
  });
}


async findPostById(
  postId: string,
  viewerUserId?: string,
) {
  return this.prisma.post.findUnique({
    where: { id: postId },
    select: {
      id: true,
      content: true,

      isPublished: true,
      isDeleted: true,
      isHidden: true,
      visibility: true,

      createdAt: true,

      author: {
        select: {
          id: true,
          displayName: true,
          avatarUrl: true,
        },
      },

      media: {
        select: {
          id: true,
          media: {
            select: {
              id: true,
              mediaType: true,
              objectKey: true,
              width: true,
              height: true,
              duration: true,
            },
          },
        },
      },

      _count: {
        select: {
          likes: true,
          comments: true,
        },
      },

      likes: viewerUserId
        ? {
            where: { userId: viewerUserId },
            select: { id: true },
          }
        : undefined,
    },
  });
 }

  async findById(postId: string): Promise<{
    id: string;
    authorId: string;
    isDeleted: boolean;
  } | null> {
    return this.prisma.post.findUnique({
      where: { id: postId },
      select: {
        id: true,
        authorId: true,
        isDeleted: true,
      },
    });
  }

  async softDelete(postId: string) {
    await this.prisma.post.update({
      where: { id: postId },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
      },
    });
  }

  async updateContent(params: {
    postId: string;
    content: string;
  }) {
    const { postId, content } = params;

    return this.prisma.post.update({
      where: { id: postId },
      data: {
        content,
        isEdited: true,
        editedAt: new Date(),
      },
      select: {
        id: true,
        content: true,
        editedAt: true,
      },
    });
  }

  async createPost(params: {
    authorId: string;
    content: string;
  }) {
    return this.prisma.post.create({
      data: {
        authorId: params.authorId,
        content: params.content,
      },
    });
  }

  async attachMedia(params: {
    postId: string;
    mediaIds: string[];
  }) {
    if (params.mediaIds.length === 0) {
      return;
    }

    await this.prisma.postMedia.createMany({
      data: params.mediaIds.map((mediaId) => ({
        postId: params.postId,
        mediaId,
      })),
      skipDuplicates: true,
    });
  }

   async findUserPosts(params: {
    userId: string;
    limit?: number;
    cursor?: string;
    scope: 'public' | 'self';
  }) {
    const { userId, limit = 20, cursor } = params;

    return this.prisma.post.findMany({
      where: {
        authorId: userId,
        isDeleted: false,
        isHidden: false,
      },
      take: limit,
      skip: cursor ? 1 : 0,
      cursor: cursor ? { id: cursor } : undefined,
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        author: {
          select: {
            id: true,
            displayName: true,
            avatarUrl: true,
          },
        },
        media: {
          include: {
            media: true,
          },
        },
      },
    });
  }

  async findPostsByTag(params: {
    tag: string;
    cursor?: string;
    limit: number;
  }) {
    const normalizedTag = params.tag.toLowerCase();

    return this.prisma.post.findMany({
      where: {
        isDeleted: false,
        isHidden: false,
        tags: {
          some: {
            tag: {
              name: normalizedTag,
            },
          },
        },
      },
      take: params.limit,
      skip: params.cursor ? 1 : 0,
      cursor: params.cursor ? { id: params.cursor } : undefined,
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        author: {
          select: {
            id: true,
            displayName: true,
            avatarUrl: true,
          },
        },
        media: {
          include: {
            media: true,
          },
        },
      },
    });
  }
  
  async findPublicPosts(params: {
  limit: number;
  cursor?: string;
  mediaType?: "video";
 }) {
  return this.prisma.post.findMany({
    where: {
      isDeleted: false,
      isHidden: false,
      visibility: "PUBLIC",
      ...(params.mediaType === "video"
        ? {
            media: {
              some: {
                media: {
                  mediaType: "VIDEO",
                },
              },
            },
          }
        : {}),
    },
    include: {
      author: true,
      media: {
        include: {
          media: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
    take: params.limit,
    ...(params.cursor
      ? { skip: 1, cursor: { id: params.cursor } }
      : {}),
  });
 }
 
 async findPostForLike(postId: string) {
    return this.prisma.post.findFirst({
      where: {
        id: postId,
        isDeleted: false,
      },
      select: {
        id: true,
        isDeleted: true,
        isHidden: true,
      },
    });
  }

  async toggleLike(params: {
    postId: string;
    userId: string;
  }): Promise<{ liked: boolean; likeCount: number }> {
    const { postId, userId } = params;

    return this.prisma.$transaction(async (tx) => {
      const existing = await tx.postLike.findUnique({
        where: {
          postId_userId: {
            postId,
            userId,
          },
        },
      });

      if (existing) {
        await tx.postLike.delete({
          where: {
            id: existing.id,
          },
        });

        const post = await tx.post.update({
          where: { id: postId },
          data: { likeCount: { decrement: 1 } },
          select: { likeCount: true },
        });

        return {
          liked: false,
          likeCount: post.likeCount,
        };
      }

      await tx.postLike.create({
        data: {
          postId,
          userId,
        },
      });

      const post = await tx.post.update({
        where: { id: postId },
        data: { likeCount: { increment: 1 } },
        select: { likeCount: true },
      });

      return {
        liked: true,
        likeCount: post.likeCount,
      };
    });
  }

  async unlike(params: {
    postId: string;
    userId: string;
  }): Promise<{ liked: false; likeCount: number }> {
    const { postId, userId } = params;

    return this.prisma.$transaction(async (tx) => {
      const existing = await tx.postLike.findUnique({
        where: {
          postId_userId: {
            postId,
            userId,
          },
        },
      });

      // 👉 idempotent: ไม่เคย like มาก่อน
      if (!existing) {
        const post = await tx.post.findUnique({
          where: { id: postId },
          select: { likeCount: true },
        });

        return {
          liked: false,
          likeCount: post?.likeCount ?? 0,
        };
      }

      await tx.postLike.delete({
        where: { id: existing.id },
      });

      const post = await tx.post.update({
        where: { id: postId },
        data: {
          likeCount: {
            decrement: 1,
          },
        },
        select: { likeCount: true },
      });

      return {
        liked: false,
        likeCount: post.likeCount,
      };
    });
  }

   async existsPost(postId: string): Promise<boolean> {
    const count = await this.prisma.post.count({
      where: {
        id: postId,
        isDeleted: false,
        isHidden: false,
      },
    });

    return count > 0;
  }

  async findLikesByPostId(params: {
    postId: string;
    cursor?: string;
    limit: number;
  }): Promise<{
    rows: Array<{
      createdAt: Date;
      user: {
        id: string;
        displayName: string | null;
        avatarUrl: string | null;
      };
    }>;
    nextCursor: string | null;
  }> {
    const { postId, cursor, limit } = params;

    const rows = await this.prisma.postLike.findMany({
      where: { postId },
      take: limit + 1,
      ...(cursor && {
        skip: 1,
        cursor: { id: cursor },
      }),
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        createdAt: true,
        user: {
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

    return { rows, nextCursor };
  }
}
