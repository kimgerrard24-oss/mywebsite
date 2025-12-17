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
      isPublished: true,
      isDeleted: false,
      isHidden: false,
    },
    select: {
      id: true,
      authorId: true,
      content: true,
      createdAt: true,
      likeCount: true,
      commentCount: true,
    },
  });
 }

}
