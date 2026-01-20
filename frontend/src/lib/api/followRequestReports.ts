// frontend/src/lib/api/followRequestReports.ts

import { apiPost } from '@/lib/api/api';

export type FollowRequestReportReason =
  | 'SPAM'
  | 'HARASSMENT'
  | 'SCAM'
  | 'INAPPROPRIATE'
  | 'OTHER';

export type CreateFollowRequestReportPayload = {
  reason: FollowRequestReportReason;
  note?: string;
};

/**
 * POST /api/reports/follow-requests
 * Backend = authority
 */
export async function reportFollowRequest(
  followRequestId: string,
  payload: CreateFollowRequestReportPayload,
): Promise<{ success: true }> {
  return apiPost(
    `/reports/follow-requests/${followRequestId}`,
    payload,
  );
}
