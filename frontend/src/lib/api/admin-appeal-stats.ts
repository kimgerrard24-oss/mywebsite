// frontend/src/lib/api/admin-appeal-stats.ts

import { apiPath } from "@/lib/api/api";
import type { AdminAppealStats } from "@/types/admin-appeal-stats";

type GetAdminAppealStatsParams = {
  cookieHeader?: string; // SSR only
};

/**
 * ==============================
 * GET /admin/appeals/stats
 * ==============================
 *
 * - SSR: forward Cookie manually
 * - CSR: use browser cookie (credentials)
 *
 * Backend is authority for admin permission
 */
export async function getAdminAppealStats(
  params?: GetAdminAppealStatsParams,
): Promise<AdminAppealStats> {
  const headers: HeadersInit = {
    Accept: "application/json",
  };

  if (params?.cookieHeader) {
    headers["Cookie"] = params.cookieHeader;
  }

  const res = await fetch(
    apiPath("/admin/appeals/stats"),
    {
      method: "GET",
      headers,
      credentials: "include",
      cache: "no-store",
    },
  );

  if (!res.ok) {
    const err: any = new Error(`HTTP ${res.status}`);
    err.status = res.status;
    throw err;
  }

  return res.json();
}

