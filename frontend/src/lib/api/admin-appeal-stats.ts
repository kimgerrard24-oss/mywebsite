// frontend/src/lib/api/admin-appeal-stats.ts

import type { GetServerSidePropsContext } from "next";
import { apiPath } from "@/lib/api/api";
import type { AdminAppealStats } from "@/types/admin-appeal-stats";

/**
 * ==============================
 * GET /admin/appeals/stats
 * ==============================
 *
 * - SSR: forward Cookie from ctx
 * - CSR: use browser cookie (credentials)
 *
 * Backend is authority for admin permission
 */
export async function getAdminAppealStats(
  ctx?: GetServerSidePropsContext,
): Promise<AdminAppealStats> {
  const headers: HeadersInit = {
    Accept: "application/json",
  };

  // ===== SSR: forward cookie =====
  if (ctx?.req) {
    const cookie = ctx.req.headers.cookie;
    if (cookie) {
      headers["Cookie"] = cookie;
    }
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


