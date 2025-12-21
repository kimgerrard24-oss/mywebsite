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

  media: {
    id: string;
    type: 'image' | 'video';
    url: string;
    objectKey: string;
  }[];

  isSelf: boolean;

  stats: {
    likeCount: number;
    commentCount: number;
  };

  canDelete: boolean;
};

export type PostFeedResponse = {
  items: PostFeedItem[];
  nextCursor?: string | null;
};

export type UserPostFeedResponse = {
  items: PostFeedItem[];
  nextCursor: string | null;
};