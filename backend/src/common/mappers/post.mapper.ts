// backend/src/common/mappers/post.mapper.ts

/**
 * ==============================
 * Types (Input side)
 * ==============================
 * ใช้ structural typing
 * ไม่ import Prisma type ตรง ๆ
 */

type PostWithAuthor = {
  id: string;
  content: string;
  createdAt: Date;
  author: {
    id: string;
    displayName: string | null;
    avatarUrl: string | null;
  };
};

/**
 * ==============================
 * Types (Output side)
 * ==============================
 * ใช้ DTO type จริง
 */

import {
  SearchPostItemDto,
} from '../../search/dto/search-posts.response.dto';

/**
 * ==============================
 * Mapper
 * ==============================
 *
 * ❗ Responsibility:
 * - serialize Date → string
 * - control API shape
 * - NO business logic
 */
export function mapPostToSearchDto(
  post: PostWithAuthor,
): SearchPostItemDto {
  return {
    id: post.id,
    content: post.content,
    createdAt: post.createdAt.toISOString(),
    author: {
      id: post.author.id,
      displayName: post.author.displayName,
      avatarUrl: post.author.avatarUrl,
    },
  };
}
