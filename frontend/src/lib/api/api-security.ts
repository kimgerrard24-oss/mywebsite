// frontend/src/lib/api/api-security.ts

import { client,apiPost } from "@/lib/api/api";

export type FetchSecurityEventsParams = {
  cursor?: string | null;
  limit?: number;
};

export async function fetchMySecurityEvents(params?: FetchSecurityEventsParams) {
  const q = new URLSearchParams();

  if (params?.cursor) q.set("cursor", params.cursor);
  if (params?.limit) q.set("limit", String(params.limit));

  const query = q.toString();
  const path = query
    ? `/users/me/security-events?${query}`
    : `/users/me/security-events`;

  return client.get<{
    items: Array<{
      id: string;
      type: string;
      ip?: string | null;
      userAgent?: string | null;
      createdAt: string;
    }>;
    nextCursor: string | null;
  }>(path);
}


/**
 * POST /api/security/account-lock
 * Backend = authority
 */
export async function lockMyAccount(
  credentialToken: string,
): Promise<{ success: true }> {
  return apiPost("/security/account-lock", {
    credentialToken,
  });
}