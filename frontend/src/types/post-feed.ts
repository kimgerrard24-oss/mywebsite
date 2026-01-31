// frontend/types/post-feed.ts
export type PostFeedItem = {
  id: string;
  content: string;

    taggedUsers?: {
    id: string;
    displayName: string | null;
    username: string;
  }[];

  createdAt: string;

  author: {
    id: string;
    displayName: string | null;
    avatarUrl: string | null;

    isFollowing: boolean;
    isBlocked: boolean;
     // 🆕 private account
    isPrivate: boolean;

    // 📨 follow request already sent
    isFollowRequested: boolean;
  };

  media: {
    id: string;
    type: 'image' | 'video';
    url: string;
    thumbnailUrl?: string | null;
    objectKey: string;
  }[];

  isSelf: boolean;

  stats: {
    likeCount: number;
    commentCount: number;
  };
  
  width: number | null;
  height: number | null;
  duration: number | null;

  canDelete: boolean;

  isLikedByViewer: boolean;

};

export type PostFeedResponse = {
  items: PostFeedItem[];
  nextCursor?: string | null;
};

export type UserPostFeedResponse = {
  items: PostFeedItem[];
  nextCursor: string | null;
};

export type FeedResponse = {
  items: PostFeedItem[];
  nextCursor: string | null;
};