// frontend/src/lib/api/admin-reports.ts

import { apiGet } from "@/lib/api/api";
import type {
  AdminReportListResponse,
  AdminReportQuery,
  AdminReportDetail,
} from "@/types/admin-report";

/**
 * ==============================
 * GET /admin/reports
 * ==============================
 *
 * - SSR / CSR compatible
 * - Backend is the sole authority
 * - Auth via HttpOnly cookie
 */
export async function fetchAdminReports(
  params?: {
    query?: AdminReportQuery;
    cookieHeader?: string;
  },
): Promise<AdminReportListResponse> {
  return apiGet<AdminReportListResponse>(
    "/admin/reports",
    {
      params: params?.query,
      headers: params?.cookieHeader
        ? { Cookie: params.cookieHeader }
        : undefined,
      withCredentials: true,
    },
  );
}

/**
 * ==============================
 * GET /admin/reports/:id
 * ==============================
 *
 * - SSR only
 * - Backend enforces ADMIN permission
 */
export async function fetchAdminReportById(
  reportId: string,
  params?: { cookieHeader?: string },
): Promise<AdminReportDetail> {
  return apiGet<AdminReportDetail>(
    `/admin/reports/${reportId}`,
    {
      headers: params?.cookieHeader
        ? { Cookie: params.cookieHeader }
        : undefined,
      withCredentials: true,
    },
  );
}
