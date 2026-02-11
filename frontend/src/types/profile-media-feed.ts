// frontend/src/types/profile-media-feed.ts

export type ProfileMediaItem = {
  id: string;
  url: string;
  thumbnailUrl?: string | null;
  type: "AVATAR" | "COVER";
  createdAt: string;
  profileType?: "AVATAR" | "COVER" | null;
};

export type ProfileMediaFeedResponse = {
  items: ProfileMediaItem[];
  nextCursor: string | null;
};
