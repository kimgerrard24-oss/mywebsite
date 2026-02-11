// frontend/src/types/profile-media-current.ts

export type CurrentProfileMediaItem = {
  mediaId: string;
  url: string;
  thumbnailUrl?: string | null;
  width?: number | null;
  height?: number | null;
};

export type GetCurrentProfileMediaResponse = {
  avatar: CurrentProfileMediaItem | null;
  cover: CurrentProfileMediaItem | null;
};
