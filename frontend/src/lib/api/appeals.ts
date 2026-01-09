// frontend/src/lib/api/appeals.ts

import { apiPost, apiGet } from "@/lib/api/api";
import type { 
  AppealTargetType, 
  Appeal,
  MyAppealDetail,
 } from "@/types/appeal";

export type CreateAppealPayload = {
  targetType: AppealTargetType;
  targetId: string;
  reason: string;
  detail?: string;
};

export type GetMyAppealsParams = {
  cursor?: string | null;
  limit?: number;
};

export type GetMyAppealsResponse = {
  items: Appeal[];
  nextCursor: string | null;
};

export async function createAppeal(
  payload: CreateAppealPayload
): Promise<{
  id: string;
  status: "PENDING";
  createdAt: string;
}> {
  return apiPost("/appeals", payload, {
    withCredentials: true, // 🔒 HttpOnly cookie
  });
}

export async function getMyAppeals(
  params: GetMyAppealsParams = {},
  ctx?: any
): Promise<GetMyAppealsResponse> {
  const query = new URLSearchParams();

  if (params.cursor) query.set("cursor", params.cursor);
  if (params.limit) query.set("limit", String(params.limit));

  const path =
    "/appeals/me" +
    (query.toString() ? `?${query}` : "");

  // SSR: use absolute fetch via apiGet (axios with cookies)
  return apiGet(path, {
    ...(ctx?.req?.headers?.cookie
      ? { headers: { Cookie: ctx.req.headers.cookie } }
      : {}),
    withCredentials: true,
  });
}

export async function getMyAppealById(params: {
  appealId: string;
  cookie?: string;
}): Promise<MyAppealDetail> {
  const { appealId, cookie } = params;

  const base =
    process.env.INTERNAL_BACKEND_URL ??
    process.env.NEXT_PUBLIC_BACKEND_URL ??
    'https://api.phlyphant.com';

  const res = await fetch(
    `${base}/appeals/me/${appealId}`,
    {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        ...(cookie ? { Cookie: cookie } : {}),
      },
      credentials: 'include',
      cache: 'no-store',
    },
  );

  if (!res.ok) {
    const err: any = new Error(
      `Failed to load appeal`,
    );
    err.status = res.status;
    throw err;
  }

  return (await res.json()) as MyAppealDetail;
}

/**
 * POST /appeals/:id/withdraw
 * Backend is authority
 */
export async function withdrawAppeal(
  appealId: string,
): Promise<{
  success: true;
  id: string;
  status: string;
  withdrawnAt: string;
}> {
  return apiPost(
    `/appeals/${appealId}/withdraw`,
    {},
    { withCredentials: true },
  );
}