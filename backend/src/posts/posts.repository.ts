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

        // ✅ FIX: ดึง media มาด้วย
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

  async findPostById(postId: string) {
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
}
