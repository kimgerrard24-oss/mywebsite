// backend/src/feed/feed.service.ts

import { Injectable } from '@nestjs/common';
import { FeedRepository } from './feed.repository';
import { PostVisibilityService } from '../posts/services/post-visibility.service';
import { FeedItemMapper } from './mappers/feed-item.mapper';
import { FeedCacheService } from './cache/feed-cache.service';

@Injectable()
export class FeedService {
  constructor(
    private readonly repo: FeedRepository,
    private readonly visibility: PostVisibilityService,
    private readonly cache: FeedCacheService,
  ) {}

  async getFeed(params: {
    viewerUserId: string | null;
    limit: number;
    cursor?: string;
    mediaType?: 'video';
  }) {
    const { viewerUserId, limit, cursor, mediaType } = params;

    // cache only for public anonymous feed
    if (!viewerUserId) {
      const cached = await this.cache.get(cursor ?? null);
      if (cached) return cached;
    }

    const rows = await this.repo.findCandidatePosts({
      limit,
      cursor,
      viewerUserId,
      mediaType,
    });

    const items = [];

    for (const post of rows) {
      const canView = await this.visibility.canViewPost({
        post,
        viewer: viewerUserId ? { userId: viewerUserId } : null,
      });

      if (!canView) continue;

      items.push(FeedItemMapper.toDto(post));
    }

    const nextCursor =
      items.length === limit ? items[items.length - 1].id : null;

    const result = { items, nextCursor };

    if (!viewerUserId) {
      await this.cache.set(cursor ?? null, result);
    }

    return result;
  }
}
