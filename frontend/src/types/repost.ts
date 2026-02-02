// frontend/src/types/repost.ts

export type CreateRepostResponse = {
  repostId: string;
  originalPostId: string;
  createdAt: string;
  repostedAt: string;
};

export type UndoRepostResult = {
  reposted: false;
  repostCount: number;
};

/**
 * Single repost user item
 */
export type RepostUserItem = {
  userId: string;
  displayName: string | null;
  avatarUrl: string | null;
  repostedAt: string; // ISO string
};

/**
 * GET /posts/:id/reposts response
 */
export type GetPostRepostsResponse = {
  items: RepostUserItem[];
  nextCursor: string | null;
};


