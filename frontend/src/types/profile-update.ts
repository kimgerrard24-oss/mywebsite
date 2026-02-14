// frontend/src/types/profile-update.ts

export type ProfileMediaType = "AVATAR" | "COVER";

export type PostVisibility =
  | "PUBLIC"
  | "FOLLOWERS"
  | "PRIVATE"
  | "CUSTOM";

export type ProfileUpdateDraft = {
  id: string;
  type: ProfileMediaType;
  mediaId: string;
  content?: string | null;
  visibility: PostVisibility;
  createdAt: string;
  updatedAt: string;
};

export type CreateProfileDraftRequest = {
  mediaId: string;
  content?: string;
  visibility?: PostVisibility;
};

export type PublishProfileDraftResponse = {
  postId: string;
};

