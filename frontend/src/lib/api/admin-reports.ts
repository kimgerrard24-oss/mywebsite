// frontend/src/lib/api/admin-reports.ts

import { apiGet } from "@/lib/api/api";
import type {
  AdminReportListResponse,
  AdminReportQuery,
  AdminReportDetail,
} from "@/types/admin-report";

export async function fetchAdminReports(
  params?: {
    query?: AdminReportQuery;
    cookieHeader?: string;
  },
): Promise<AdminReportListResponse> {
  return apiGet("/admin/reports", {
    params: params?.query,
    headers: params?.cookieHeader
      ? { Cookie: params.cookieHeader }
      : undefined,
  });
  
}

export async function fetchAdminReportById(
  reportId: string,
  params?: { cookieHeader?: string },
): Promise<AdminReportDetail> {
  return apiGet(`/admin/reports/${reportId}`, {
    headers: params?.cookieHeader
      ? { Cookie: params.cookieHeader }
      : undefined,
  });
}  