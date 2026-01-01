// backend/src/search/dto/search-users.response.dto.ts

export type SearchUserItemDto = {
  id: string;
  username: string;
  displayName: string | null;
  avatarUrl: string | null;
};

export type SearchUsersResponseDto = {
  items: SearchUserItemDto[];
  nextCursor: string | null;
};
