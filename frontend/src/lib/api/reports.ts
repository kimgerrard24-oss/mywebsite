// frontend/src/lib/api/reports.ts

import { apiPost, apiGet } from "@/lib/api/api";

export type CreateReportPayload = {
  targetType: "POST" | "COMMENT" | "USER";
  targetId: string;
  reason:
    | "SPAM"
    | "HARASSMENT"
    | "HATE_SPEECH"
    | "SCAM"
    | "NSFW"
    | "MISINFORMATION"
    | "OTHER";
  description?: string;
};

export type MyReportItem = {
  id: string;
  targetType: "POST" | "COMMENT" | "USER";
  targetId: string;
  reason: string;
  status: string;
  createdAt: string;
};

export type MyReportDetail = {
  id: string;
  targetType: "POST" | "COMMENT" | "USER";
  targetId: string;
  reason: string;
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

  return apiGet("/reports/me", {
    params: {
      cursor: cursor ?? undefined,
      limit,
    },
    withCredentials: true, // 🔒 HttpOnly cookie
  });
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