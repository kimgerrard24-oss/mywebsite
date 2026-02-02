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
   * 🔁 Repost state (viewer-specific)
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
