// frontend/src/types/post-detail.ts

export type PostDetail = {
  id: string;
  content: string;
  createdAt: string;

  author: {
    id: string;
    displayName: string;
    avatarUrl: string | null;
    isBlocked?: boolean;
    hasBlockedViewer?: boolean;
  };

  media: {
    id: string;
    type: string;
    cdnUrl: string;
    url?: string; // optional for backward compatibility
  }[];

  likeCount: number;
  isLikedByViewer: boolean;

  canDelete: boolean;
};
