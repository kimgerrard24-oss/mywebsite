// frontend/src/lib/api/cover-update.ts

import { api } from "./api";
import type {
  CreateCoverDraftRequest,
  CoverUpdateDraft,
  PublishCoverDraftResponse,
} from "@/types/cover-update";

export async function createCoverUpdateDraft(
  payload: CreateCoverDraftRequest,
): Promise<CoverUpdateDraft> {
  const res = await api.post<CoverUpdateDraft>(
    "/users/me/cover-update/draft",
    payload,
    { withCredentials: true },
  );

  return res.data;
}

export async function publishCoverUpdate(): Promise<PublishCoverDraftResponse> {
  const res = await api.post<PublishCoverDraftResponse>(
    "/users/me/cover-update/publish",
    {},
    { withCredentials: true },
  );

  return res.data;
}
