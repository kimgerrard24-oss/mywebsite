// frontend/src/lib/api/admin-appeal-stats.ts

import { apiPath } from "@/lib/api/api";
import type { AdminAppealStats } from "@/types/admin-appeal-stats";

type SSRContext = {
  cookieHeader?: string;
};

/**
 * ==============================
 * GET /admin/appeals/stats
 * ==============================
 *
 * - SSR: fetch + manual Cookie forward
 * - CSR: fetch with credentials
 *
 * Backend is authority
 */
export async function getAdminAppealStats(
  ctx?: SSRContext,
): Promise<AdminAppealStats> {
  // 🔒 SSR path
  if (ctx?.cookieHeader) {
    const res = await fetch(
      apiPath("/admin/appeals/stats"),
      {
        method: "GET",
        headers: {
          Accept: "application/json",
          Cookie: ctx.cookieHeader,
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

  // ✅ CSR path
  const res = await fetch(
    apiPath("/admin/appeals/stats"),
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
