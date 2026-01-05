// frontend/src/lib/api/admin-dashboard.ts

import { apiGet } from "@/lib/api/api";
import type { AdminDashboardData } from "@/types/admin-dashboard";

export async function fetchAdminDashboard(
  params?: { cookieHeader?: string },
): Promise<AdminDashboardData> {
  return apiGet("/admin/dashboard", {
    headers: params?.cookieHeader
      ? { Cookie: params.cookieHeader }
      : undefined,
  });
}
