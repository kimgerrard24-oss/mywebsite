// backend/src/search/search-tags.repository.ts

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SearchTagsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async searchTags(params: {
    q: string;
    limit: number;
    cursor?: string;
  }) {
    const { q, limit, cursor } = params;

    const tags = await this.prisma.tag.findMany({
      where: {
        name: {
          contains: q,
          mode: 'insensitive',
        },
      },
      orderBy: [
        { postCount: 'desc' }, // popularity first
        { name: 'asc' },
      ],
      take: limit + 1,
      ...(cursor && {
        skip: 1,
        cursor: { id: cursor },
      }),
      select: {
        id: true,
        name: true,
        postCount: true,
      },
    });

    const hasNext = tags.length > limit;
    const items = hasNext ? tags.slice(0, limit) : tags;

    return {
      items,
      nextCursor: hasNext ? items[items.length - 1].id : null,
    };
  }
}
