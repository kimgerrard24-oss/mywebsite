// backend/src/search/dto/search-tags.response.dto.ts

export type SearchTagItemDto = {
  id: string;
  name: string;
  postCount: number;
};

export type SearchTagsResponseDto = {
  items: SearchTagItemDto[];
  nextCursor: string | null;
};
