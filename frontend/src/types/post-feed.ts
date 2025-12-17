// frontend/types/post-feed.ts
export type PostFeedItem = {
  id: string;
  content: string;
  createdAt: string;
  authorId: string;

  likeCount: number;
  commentCount: number;
};


export type PostFeedResponse = {
  items: PostFeedItem[];
  nextCursor?: string | null;
};
