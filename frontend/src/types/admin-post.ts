// frontend/src/types/admin-post.ts

export type AdminPostDetail = {
  id: string;
  content: string;
  createdAt: string;

  isHidden: boolean;
  isDeleted: boolean;
  deletedSource?: string | null;
  effectiveVisibility: "PUBLIC" | "PRIVATE";
  overriddenByAdmin: boolean;

  author: {
    id: string;
    username: string;
    displayName: string | null;
    avatarUrl: string | null;
  };

  stats: {
    commentCount: number;
    likeCount: number;
  };
};
