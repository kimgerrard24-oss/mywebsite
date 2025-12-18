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
        authorId: true,

        media: {
          select: {
            id: true,
            type: true,
            r2Key: true,
            cdnUrl: true,
          },
        },
      },
    });
  }
}
