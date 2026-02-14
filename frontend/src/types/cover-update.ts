// frontend/src/types/cover-update.ts

export type CoverUpdateDraft = {
  id: string;
  userId: string;
  type: "COVER";
  mediaId: string;
  content?: string | null;
  visibility: "PUBLIC" | "FOLLOWERS" | "PRIVATE" | "CUSTOM";
  status: "DRAFT" | "PUBLISHED" | "CANCELLED" | "EXPIRED";
  createdAt: string;
  updatedAt: string;
};

export type CreateCoverDraftRequest = {
  mediaId: string;
  content?: string;
  visibility?: "PUBLIC" | "FOLLOWERS" | "PRIVATE" | "CUSTOM";
};

export type PublishCoverDraftResponse = {
  postId: string;
};
