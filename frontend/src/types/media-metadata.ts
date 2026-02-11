// frontend/src/types/media-metadata.ts

export type MediaUsedPost = {
  id: string;
  content: string;
  createdAt: string;
  author: {
    id: string;
    username: string;
    avatarUrl: string | null;
  };
};

export type MediaMetadata = {
  id: string;
  type: "image" | "video";
  url: string;
  thumbnailUrl?: string;
  ownerUserId: string;
  postId: string | null;
  createdAt: string;
  isOwner: boolean;
  canAppeal?: boolean;

  usedPost?: MediaUsedPost;
};
