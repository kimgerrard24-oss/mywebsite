// frontend/src/lib/api/admin-appeals.ts

import type { 
  AdminAppealsResponse,
  AdminAppealDetail,
  } from "@/types/admin-appeal";
import { client } from "./api";

export async function getAdminAppeals(
  params: {
    limit?: number;
    cursor?: string;
    status?: string;
    targetType?: string;
  },
  ctx?: any,
): Promise<AdminAppealsResponse> {
  const base =
    process.env.INTERNAL_BACKEND_URL ??
    process.env.NEXT_PUBLIC_BACKEND_URL ??
    "https://api.phlyphant.com";

  const q = new URLSearchParams();

  if (params.limit)
    q.set("limit", String(params.limit));
  if (params.cursor)
    q.set("cursor", params.cursor);
  if (params.status)
    q.set("status", params.status);
  if (params.targetType)
    q.set("targetType", params.targetType);

  const cookie =
    ctx?.req?.headers?.cookie ?? "";

  const res = await fetch(
    `${base}/admin/appeals?${q.toString()}`,
    {
      method: "GET",
      headers: {
        Accept: "application/json",
        ...(cookie ? { Cookie: cookie } : {}),
      },
      credentials: "include",
      cache: "no-store",
    },
  );

  if (!res.ok) {
    const err: any = new Error(
      "Failed to load admin appeals",
    );
    err.status = res.status;
    throw err;
  }

  return (await res.json()) as AdminAppealsResponse;
}

export async function getAdminAppealById(params: {
  appealId: string;
  cookie?: string;
}): Promise<AdminAppealDetail> {
  const base =
    process.env.INTERNAL_BACKEND_URL ??
    process.env.NEXT_PUBLIC_BACKEND_URL ??
    'https://api.phlyphant.com';

  const res = await fetch(
    `${base}/admin/appeals/${params.appealId}`,
    {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        ...(params.cookie
          ? { Cookie: params.cookie }
          : {}),
      },
      credentials: 'include',
      cache: 'no-store',
    },
  );

  if (!res.ok) {
    const err: any = new Error(
      'Failed to load appeal',
    );
    err.status = res.status;
    throw err;
  }

  return (await res.json()) as AdminAppealDetail;
}

export async function resolveAppeal(params: {
  appealId: string;
  decision: "APPROVED" | "REJECTED";
  resolutionNote?: string;
}) {
  return client.post(
    `/admin/appeals/${params.appealId}/resolve`,
    {
      decision: params.decision,
      resolutionNote: params.resolutionNote,
    },
  );
}