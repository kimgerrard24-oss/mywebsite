// frontend/src/types/post-detail.ts
import type { PostUserTagItem } from "@/types/post-user-tag";

export type PostVisibility =
  | "PUBLIC"
  | "FOLLOWERS"
  | "PRIVATE"
  | "CUSTOM";

export type PostDetail = {
  id: string;
  content: string;
  createdAt: string;
  visibility: PostVisibility;

   /**
   * 🆕 repost state
   */
  isRepost: boolean;

  /**
   * 🆕 original post (for repost only)
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
      type: "image" | "video";
      url: string;
    }[];
  };

  author: {
    id: string;
    displayName: string;
    avatarUrl: string | null;
    isBlocked?: boolean;
    hasBlockedViewer?: boolean;
  };

  media: {
    id: string;
    type: "image" | "video";
    cdnUrl: string;
    thumbnailUrl?: string | null;
    url?: string; // optional for backward compatibility
  }[];

  /**
   * 🔢 Repost count
   */
  repostCount?: number;
  
  userTags?: PostUserTagItem[];

  hasReposted?: boolean;

  likeCount: number;
  commentCount: number;
  isLikedByViewer: boolean;

  canDelete: boolean;
  canAppeal?: boolean;
};
