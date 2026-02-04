// frontend/types/post-feed.ts
export type PostFeedItem = {
  id: string;
  content: string;

    taggedUsers?: {
    id: string;
    displayName: string | null;
    username: string;
  }[];

  isTaggedUser?: boolean;

  isHiddenByTaggedUser?: boolean;

  createdAt: string;

   /**
   * 🆕 post type
   */
  type: 'post' | 'repost';

   /**
   * 🆕 repost metadata (Facebook-style)
   */
  repost?: {
    repostId: string;
    repostedAt: string;
    actor: {
      id: string;
      displayName: string | null;
      avatarUrl: string | null;
    };
  };

  /**
   * 🆕 original post (for repost)
   */
  originalPost?: {
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
  };


  author: {
    id: string;
    displayName: string | null;
    avatarUrl: string | null;

    isFollowing: boolean;
    isBlocked: boolean;
    isPrivate: boolean;

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
    repostCount: number;
  };

  hasReposted?: boolean;
  
  width: number | null;
  height: number | null;
  duration: number | null;

  canDelete: boolean;

  isLikedByViewer: boolean;

};

export type PostFeedResponse = {
  items: PostFeedItem[];
  nextCursor: string | null;
};

export type UserPostFeedResponse = {
  items: PostFeedItem[];
  nextCursor: string | null;
};

export type FeedResponse = {
  items: PostFeedItem[];
  nextCursor: string | null;
};