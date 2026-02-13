// frontend/src/types/profile-media-feed.ts

export type ProfileMediaCategory = "AVATAR" | "COVER";

export type ProfileMediaItem = {
  id: string;
  url: string;
  thumbnailUrl?: string | null;

  // mediaCategory จาก backend
  type: ProfileMediaCategory;

  createdAt: string;

  // media.profileType (current marker)
  profileType?: ProfileMediaCategory | null;
  postId: string;
};

export type ProfileMediaFeedResponse = {
  items: ProfileMediaItem[];
  nextCursor: string | null;
};

