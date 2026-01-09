// frontend/src/lib/api/admin-appeal-stats.ts

import type { GetServerSidePropsContext } from "next";
import type { AdminAppealStats } from "@/types/admin-appeal-stats";

export async function getAdminAppealStats(
  ctx: GetServerSidePropsContext,
): Promise<AdminAppealStats> {
  const cookie =
    ctx.req.headers.cookie ?? "";

  const base =
    process.env.INTERNAL_BACKEND_URL ??
    process.env.NEXT_PUBLIC_BACKEND_URL ??
    "https://api.phlyphant.com";

  const res = await fetch(
    `${base}/admin/appeals/stats`,
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
      "Failed to load appeal stats",
    );
    err.status = res.status;
    throw err;
  }

  return (await res.json()) as AdminAppealStats;
}
