// frontend/src/lib/api/shares.ts

import { api } from "./api";

export type ShareIntentResult = {
  canShareInternal: boolean;
  canShareExternal: boolean;
  reason:
    | "OK"
    | "NOT_FOUND"
    | "POST_DELETED"
    | "POST_HIDDEN"
    | "BLOCKED"
    | "VISIBILITY_DENIED"
    | "ACCOUNT_PRIVATE";
  requireFollow?: boolean;
};

export async function checkShareIntent(
  postId: string,
): Promise<ShareIntentResult> {
  const res = await api.post<ShareIntentResult>(
    "/shares/intent",
    { postId },
    { withCredentials: true },
  );

  return res.data;
}

export type CreateSharePayload = {
  postId: string;
  targetUserId?: string;
  targetChatId?: string;
};

export type CreateShareResponse = {
  id: string;
  createdAt: string;
};

export async function createShare(
  payload: CreateSharePayload,
): Promise<CreateShareResponse> {
  const res = await api.post<CreateShareResponse>(
    "/shares",
    payload,
    { withCredentials: true },
  );

  return res.data;
}

export type CreateExternalShareResponse = {
  id: string;
  code: string;
  url: string;
  createdAt: string;
};

export async function createExternalShare(
  postId: string,
): Promise<CreateExternalShareResponse> {
  const res = await api.post<CreateExternalShareResponse>(
    "/shares/external",
    { postId },
    { withCredentials: true },
  );

  return res.data;
}