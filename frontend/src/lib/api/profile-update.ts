// frontend/src/lib/api/profile-update.ts

import { api } from "./api";
import type {
  ProfileUpdateDraft,
  PostVisibility,
} from "@/types/profile-update";

/**
 * Create or update profile update draft
 */
export async function createProfileUpdateDraft(payload: {
  mediaId: string;
  content?: string;
  visibility?: PostVisibility;
}): Promise<ProfileUpdateDraft> {
  const res = await api.post<ProfileUpdateDraft>(
    "/users/me/profile-update/draft",
    payload,
    { withCredentials: true },
  );

  return res.data;
}

/**
 * Publish current profile update draft
 */
export async function publishProfileUpdate(): Promise<{
  postId: string;
}> {
  const res = await api.post<{ postId: string }>(
    "/users/me/profile-update/publish",
    {}, // publish ไม่มี body
    { withCredentials: true },
  );

  return res.data;
}

