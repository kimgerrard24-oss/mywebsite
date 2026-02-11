// backend/src/profile/dto/get-current-profile-media.response.dto.ts

export class CurrentProfileMediaItemDto {
  mediaId!: string;
  url!: string;
  thumbnailUrl?: string | null;
  width?: number | null;
  height?: number | null;
}

export class GetCurrentProfileMediaResponseDto {
  avatar!: CurrentProfileMediaItemDto | null;
  cover!: CurrentProfileMediaItemDto | null;
}
