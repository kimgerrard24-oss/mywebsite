// frontend/src/lib/api/profile-update.ts

import { api } from "./api";
import type {
  CreateDraftRequest,
  ProfileUpdateDraft,
  PublishDraftRequest,
  PublishDraftResponse,
} from "@/types/profile-update";

export async function createProfileUpdateDraft(
  payload: CreateDraftRequest,
): Promise<ProfileUpdateDraft> {
  const res = await api.post<ProfileUpdateDraft>(
    "/users/me/profile-update/draft",
    payload,
    { withCredentials: true },
  );

  return res.data;
}

export async function publishProfileUpdate(
  payload: PublishDraftRequest,
): Promise<PublishDraftResponse> {
  const res = await api.post<PublishDraftResponse>(
    "/users/me/profile-update/publish",
    payload,
    { withCredentials: true },
  );

  return res.data;
}
