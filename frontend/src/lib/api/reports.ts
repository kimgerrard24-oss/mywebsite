// frontend/src/lib/api/reports.ts

import { apiPost, apiGet } from "@/lib/api/api";
import type { ReportTargetType } from "@/types/report";

export type ReportReason =
  | "SPAM"
  | "HARASSMENT"
  | "HATE_SPEECH"
  | "SCAM"
  | "NSFW"
  | "MISINFORMATION"
  | "OTHER";

export type CreateReportPayload = {
  targetType: ReportTargetType;
  targetId: string;
  reason: ReportReason;
  description?: string;
};

export type MyReportItem = {
  id: string;
  targetType: ReportTargetType;
  targetId: string;
  reason: ReportReason;
  status: string;
  createdAt: string;
};

export type MyReportDetail = {
  id: string;
  targetType: ReportTargetType;
  targetId: string;
  reason: ReportReason;
  description: string | null;
  status: string;
  createdAt: string;
};

/**
 * POST /reports
 * Backend = authority
 */
export async function createReport(
  payload: CreateReportPayload,
): Promise<{ success: true }> {
  return apiPost("/reports", payload);
}

export async function getMyReports(params?: {
  cursor?: string | null;
  limit?: number;
}): Promise<{
  items: MyReportItem[];
  nextCursor: string | null;
}> {
  const { cursor, limit = 20 } = params ?? {};

  const res = await apiGet("/reports/me", {
    params: {
      cursor: cursor ?? undefined,
      limit,
    },
    withCredentials: true,
  });

  /**
   * Backend response:
   * { items, nextCursor }
   *
   * apiGet may wrap response depending on axios config
   * Normalize here to keep hook simple and safe
   */
  if (res?.items && 'nextCursor' in res) {
    return res;
  }

  if (res?.data?.items && 'nextCursor' in res.data) {
    return res.data;
  }

  return {
    items: [],
    nextCursor: null,
  };
}


export async function getMyReportById(
  reportId: string,
  ctx?: any,
): Promise<MyReportDetail> {
  return apiGet(`/reports/me/${reportId}`, {
    ...(ctx ? { headers: ctx.req?.headers } : {}),
    withCredentials: true,
  });
}