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

@Injectable()
export class SearchService {
  constructor(
    private readonly postsRepo: SearchPostsRepository,
    private readonly usersRepo: SearchUsersRepository,
    private readonly tagsRepo: SearchTagsRepository,
  ) {}

  async searchPosts(
    query: SearchPostsQueryDto & {
      viewerUserId?: string | null; // ✅ optional (backward compatible)
    },
  ): Promise<SearchPostsResponseDto> {
    const { q, limit, cursor } = query;

    const result = await this.postsRepo.searchPosts({
      q,
      limit: limit ?? 20,
      cursor,
      viewerUserId: query.viewerUserId ?? null, // ✅ pass-through
    });

    return {
      items: result.items.map(mapPostToSearchDto),
      nextCursor: result.nextCursor,
    };
  }

  async searchUsers(
    query: SearchUsersQueryDto & {
      viewerUserId?: string | null; // ✅ optional
    },
  ): Promise<SearchUsersResponseDto> {
    const { q, limit, cursor } = query;

    /**
     * Fail-soft:
     * - ไม่เจอ user = items ว่าง
     * - ไม่ throw error
     */
    return this.usersRepo.searchUsers({
      q,
      limit: limit ?? 20,
      cursor,
      viewerUserId: query.viewerUserId ?? null, // ✅ block-aware search
    });
  }

  async searchTags(
    query: SearchTagsQueryDto & {
      viewerUserId?: string | null; // ✅ optional
    },
  ): Promise<SearchTagsResponseDto> {
    const { q, limit, cursor } = query;

    const result = await this.tagsRepo.searchTags({
      q,
      limit: limit ?? 20,
      cursor,
      viewerUserId: query.viewerUserId ?? null, // ✅ filter posts by block
    });

    return {
      items: result.items.map(mapTagToSearchDto),
      nextCursor: result.nextCursor,
    };
  }
}
