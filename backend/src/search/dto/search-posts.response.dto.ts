// backend/src/search/dto/search-posts.response.dto.ts

export type SearchPostItemDto = {
  id: string;
  content: string;
  createdAt: string;

  author: {
    id: string;
    displayName: string | null;
    avatarUrl: string | null;
  };
};

export type SearchPostsResponseDto = {
  items: SearchPostItemDto[];
  nextCursor: string | null;
};
