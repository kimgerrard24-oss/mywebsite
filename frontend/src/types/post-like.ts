// frontend/src/types/post-like.ts
export type PostLike = {
  userId: string;
  displayName: string | null;
  avatarUrl: string | null;
  likedAt: string;
};

export type PostLikeResponse = {
  items: PostLike[];
  nextCursor: string | null;
};
