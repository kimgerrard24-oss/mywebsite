// frontend/src/lib/api/cover-update.ts

import { api } from "./api";
import type {
  CoverUpdateDraft,
  PostVisibility,
} from "@/types/cover-update";

/**
 * Create or update cover update draft
 */
export async function createCoverUpdateDraft(payload: {
  mediaId: string;
  content?: string;
  visibility?: PostVisibility;
}): Promise<CoverUpdateDraft> {
  const res = await api.post<CoverUpdateDraft>(
    "/users/me/cover-update/draft",
    payload,
    { withCredentials: true },
  );

  return res.data;
}

/**
 * Publish current cover update draft
 */
export async function publishCoverUpdate(): Promise<{
  postId: string;
}> {
  const res = await api.post<{ postId: string }>(
    "/users/me/cover-update/publish",
    {}, // publish ไม่มี body
    { withCredentials: true },
  );

  return res.data;
}
