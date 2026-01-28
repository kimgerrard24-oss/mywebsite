// frontend/src/lib/api/admin-shares.ts

import { apiPath } from "@/lib/api/api";

type SSRContext = {
  cookieHeader?: string;
};

/**
 * ================================
 * GET /moderation/shares/:id
 * ================================
 */
export async function fetchAdminShareById(
  shareId: string,
  options?: SSRContext,
) {
  if (options?.cookieHeader) {
    const res = await fetch(
      apiPath(`/moderation/shares/${shareId}`),
      {
        method: "GET",
        headers: {
          Accept: "application/json",
          Cookie: options.cookieHeader,
        },
        credentials: "include",
        cache: "no-store",
      },
    );

    if (!res.ok) {
      const err: any = new Error(
        `HTTP ${res.status}`,
      );
      err.status = res.status;
      throw err;
    }

    return res.json();
  }

  const res = await fetch(
    apiPath(`/moderation/shares/${shareId}`),
    {
      credentials: "include",
      cache: "no-store",
    },
  );

  if (!res.ok) {
    const err: any = new Error(
      `HTTP ${res.status}`,
    );
    err.status = res.status;
    throw err;
  }

  return res.json();
}

/**
 * ================================
 * POST /moderation/shares/:id/disable
 * ================================
 */
export async function disableShareByAdmin(
  params: {
    shareId: string;
    reason: string;
  },
) {
  if (!params.shareId) {
    throw new Error("shareId required");
  }

  if (!params.reason?.trim()) {
    throw new Error("reason required");
  }

  const res = await fetch(
    apiPath(
      `/moderation/shares/${params.shareId}/disable`,
    ),
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({
        reason: params.reason.trim(),
      }),
    },
  );

  if (!res.ok) {
    const err: any = new Error(
      `HTTP ${res.status}`,
    );
    err.status = res.status;
    throw err;
  }

  return res.json();
}
