// frontend/src/types/cover-update.ts

export type ProfileMediaType = "AVATAR" | "COVER";

export type PostVisibility =
  | "PUBLIC"
  | "FOLLOWERS"
  | "PRIVATE"
  | "CUSTOM";

export type CoverUpdateDraft = {
  id: string;
  type: ProfileMediaType;
  mediaId: string;
  content?: string | null;
  visibility: PostVisibility;
  createdAt: string;
  updatedAt: string;
};

export type CreateCoverDraftRequest = {
  mediaId: string;
  content?: string;
  visibility?: PostVisibility;
};

export type PublishCoverDraftResponse = {
  postId: string;
};
