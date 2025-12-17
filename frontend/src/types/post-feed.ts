// frontend/types/post-feed.ts
export type PostFeedItem = {
  id: string;
  content: string;
  createdAt: string;

  author: {
    id: string;
    displayName: string | null;
    avatarUrl: string | null;
  };

  stats: {
    likeCount: number;
    commentCount: number;
  };
};

export type PostFeedResponse = {
  items: PostFeedItem[];
  nextCursor?: string | null;
};
