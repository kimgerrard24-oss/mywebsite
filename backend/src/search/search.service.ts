// backend/src/search/search.service.ts
import { Injectable } from '@nestjs/common';
import { SearchPostsRepository } from './search-posts.repository';
import { SearchPostsQueryDto } from './dto/search-posts.query.dto';
import { SearchPostsResponseDto } from './dto/search-posts.response.dto';
import { mapPostToSearchDto } from '../common/mappers/post.mapper';
import { SearchUsersRepository } from './search-users.repository';
import { SearchUsersQueryDto } from './dto/search-users.query.dto';
import { SearchUsersResponseDto } from './dto/search-users.response.dto';
import { SearchTagsRepository } from './search-tags.repository';
import { SearchTagsQueryDto } from './dto/search-tags.query.dto';
import { SearchTagsResponseDto } from './dto/search-tags.response.dto';
import { mapTagToSearchDto } from '../common/mappers/tag.mapper';
import { AuditService } from '../auth/audit.service';
import { buildCdnUrl } from '../media/utils/build-cdn-url.util';

@Injectable()
export class SearchService {
  constructor(
    private readonly postsRepo: SearchPostsRepository,
    private readonly usersRepo: SearchUsersRepository,
    private readonly tagsRepo: SearchTagsRepository,
    private readonly audit: AuditService,
  ) {}

    async searchPosts(
    query: SearchPostsQueryDto & {
      viewerUserId?: string | null;
    },
  ): Promise<SearchPostsResponseDto> {
    const { q, limit, cursor } = query;

    const result = await this.postsRepo.searchPosts({
      q,
      limit: limit ?? 20,
      cursor,
      viewerUserId: query.viewerUserId ?? null,
    });

    // ✅ AUDIT (fail-soft)
    try {
      await this.audit.createLog({
        userId: query.viewerUserId ?? null,
        action: 'search.posts',
        success: true,
        metadata: {
          q,
          limit: limit ?? 20,
          hasCursor: !!cursor,
          resultCount: result.items.length,
        },
      });
    } catch {}

    return {
      items: result.items.map(mapPostToSearchDto),
      nextCursor: result.nextCursor,
    };
  }


    async searchUsers(
    query: SearchUsersQueryDto & {
      viewerUserId?: string | null;
    },
  ): Promise<SearchUsersResponseDto> {
    const { q, limit, cursor } = query;

    const result = await this.usersRepo.searchUsers({
      q,
      limit: limit ?? 20,
      cursor,
      viewerUserId: query.viewerUserId ?? null,
    });

    // ✅ AUDIT (fail-soft)
    try {
      await this.audit.createLog({
        userId: query.viewerUserId ?? null,
        action: 'search.users',
        success: true,
        metadata: {
          q,
          limit: limit ?? 20,
          hasCursor: !!cursor,
          resultCount: result.items.length,
        },
      });
    } catch {}

    return {
  items: result.items.map((u) => ({
    id: u.id,
    username: u.username,
    displayName: u.displayName,
    avatarUrl: u.avatarMedia
      ? buildCdnUrl(u.avatarMedia.objectKey)
      : null,
  })),
  nextCursor: result.nextCursor,
};

  }


    async searchTags(
    query: SearchTagsQueryDto & {
      viewerUserId?: string | null;
    },
  ): Promise<SearchTagsResponseDto> {
    const { q, limit, cursor } = query;

    const result = await this.tagsRepo.searchTags({
      q,
      limit: limit ?? 20,
      cursor,
      viewerUserId: query.viewerUserId ?? null,
    });

    // ✅ AUDIT (fail-soft)
    try {
      await this.audit.createLog({
        userId: query.viewerUserId ?? null,
        action: 'search.tags',
        success: true,
        metadata: {
          q,
          limit: limit ?? 20,
          hasCursor: !!cursor,
          resultCount: result.items.length,
        },
      });
    } catch {}

    return {
      items: result.items.map(mapTagToSearchDto),
      nextCursor: result.nextCursor,
    };
  }

}
