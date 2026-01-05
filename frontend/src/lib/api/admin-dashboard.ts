// frontend/src/lib/api/admin-dashboard.ts

import { apiPath } from "@/lib/api/api";
import type { AdminDashboardData } from "@/types/admin-dashboard";

type SSRContext = {
  cookieHeader?: string;
};

/**
 * ==============================
 * GET /admin/dashboard
 * ==============================
 *
 * - SSR: fetch + Cookie (manual forward)
 * - CSR: fetch with credentials
 *
 * Backend is authority
 */
export async function fetchAdminDashboard(
  ctx?: SSRContext,
): Promise<AdminDashboardData> {
  // 🔒 SSR path
  if (ctx?.cookieHeader) {
    const res = await fetch(
      apiPath("/admin/dashboard"),
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
    apiPath("/admin/dashboard"),
    {
      credentials: "include",
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
