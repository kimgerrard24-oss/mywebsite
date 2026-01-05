// frontend/src/lib/api/admin-report-stats.ts

import { apiGet } from "@/lib/api/api";
import type { GetServerSidePropsContext } from "next";

export type AdminReportStats = {
  total: number;
  byStatus: Record<string, number>;
  byTargetType: Record<string, number>;
  activity: {
    last24h: number;
    last7d: number;
  };
};

/**
 * GET /admin/reports/stats
 * Admin-only
 */
export async function getAdminReportStats(
  ctx?: GetServerSidePropsContext,
): Promise<AdminReportStats> {
  if (ctx) {
    // SSR
    const base =
      process.env.INTERNAL_BACKEND_URL ??
      process.env.NEXT_PUBLIC_BACKEND_URL ??
      "https://api.phlyphant.com";

    const res = await fetch(
      `${base}/admin/reports/stats`,
      {
        method: "GET",
        headers: {
          cookie: ctx.req.headers.cookie ?? "",
          Accept: "application/json",
        },
        credentials: "include",
      },
    );

    if (!res.ok) {
      const err: any = new Error("Failed");
      err.status = res.status;
      throw err;
    }

    return res.json();
  }

  // CSR
  return apiGet("/admin/reports/stats");
}
