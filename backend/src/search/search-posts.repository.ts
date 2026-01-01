// backend/src/search/search-posts.repository.ts

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SearchPostsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async searchPosts(params: {
    q: string;
    limit: number;
    cursor?: string;
  }) {
    const { q, limit, cursor } = params;

    const posts = await this.prisma.post.findMany({
      where: {
        isDeleted: false,
        content: {
          contains: q,
          mode: 'insensitive',
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit + 1,
      ...(cursor && {
        skip: 1,
        cursor: { id: cursor },
      }),
      select: {
        id: true,
        content: true,
        createdAt: true,
        author: {
          select: {
            id: true,
            displayName: true,
            avatarUrl: true,
          },
        },
      },
    });

    const hasNext = posts.length > limit;
    const items = hasNext ? posts.slice(0, limit) : posts;

    return {
      items,
      nextCursor: hasNext ? items[items.length - 1].id : null,
    };
  }
}
