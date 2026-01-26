// frontend/src/types/post.ts

export type PostVisibility =
  | "PUBLIC"
  | "FOLLOWERS"
  | "PRIVATE"
  | "CUSTOM";

export type CreatePostPayload = {
  content: string;
  mediaIds?: string[];

  // ===== post visibility =====
  visibility?: PostVisibility;
  includeUserIds?: string[];
  excludeUserIds?: string[];

  taggedUserIds?: string[];
};
