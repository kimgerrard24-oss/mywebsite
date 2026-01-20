// frontend/src/lib/api/followRequests.ts

import { API_BASE } from '@/lib/api/api';

export async function sendFollowRequest(
  targetUserId: string,
): Promise<void> {
  const res = await fetch(
    `${API_BASE}/follows/requests/${targetUserId}`,
    {
      method: 'POST',
      credentials: 'include', // 🔒 HttpOnly cookie
      headers: {
        Accept: 'application/json',
      },
    },
  );

  if (!res.ok) {
    if (res.status === 401) {
      throw new Error('UNAUTHORIZED');
    }

    if (res.status === 403) {
      throw new Error('FORBIDDEN');
    }

    if (res.status === 409) {
      throw new Error('REQUEST_CONFLICT');
    }

    throw new Error('FOLLOW_REQUEST_FAILED');
  }
}

// ================================
// Cancel follow request
// DELETE /api/follows/requests/:targetUserId
// ================================
export async function cancelFollowRequest(
  targetUserId: string,
): Promise<void> {
  const res = await fetch(
    `${API_BASE}/follows/requests/${targetUserId}`,
    {
      method: 'DELETE',
      credentials: 'include',
      headers: { Accept: 'application/json' },
    },
  );

  if (!res.ok) {
    if (res.status === 401) throw new Error('UNAUTHORIZED');
    if (res.status === 404) throw new Error('REQUEST_NOT_FOUND');
    if (res.status === 403) throw new Error('FORBIDDEN');
    throw new Error('CANCEL_FOLLOW_REQUEST_FAILED');
  }
}

// ================================
// Get incoming follow requests
// GET /api/follows/requests/incoming
// ================================
export type IncomingFollowRequest = {
  id: string;
  requesterId: string;
  username: string;
  displayName: string | null;
  avatarUrl: string | null;
  createdAt: string;
};

export type IncomingFollowRequestsResponse = {
  items: IncomingFollowRequest[];
  nextCursor: string | null;
};

export async function getIncomingFollowRequests(params?: {
  cursor?: string;
  limit?: number;
}): Promise<IncomingFollowRequestsResponse> {
  const qs = new URLSearchParams();

  if (params?.cursor) qs.set('cursor', params.cursor);
  if (params?.limit)
    qs.set('limit', String(params.limit));

  const url = `${API_BASE}/follows/requests/incoming${
    qs.toString() ? `?${qs.toString()}` : ''
  }`;

  const res = await fetch(url, {
    method: 'GET',
    credentials: 'include', // 🔒 HttpOnly cookie
    headers: { Accept: 'application/json' },
  });

  if (!res.ok) {
    if (res.status === 401)
      throw new Error('UNAUTHORIZED');
    if (res.status === 403)
      throw new Error('FORBIDDEN');
    throw new Error(
      'GET_INCOMING_FOLLOW_REQUESTS_FAILED',
    );
  }

  return res.json();
}

// ================================
// Approve follow request
// POST /api/follows/requests/:requestId/approve
// ================================
export async function approveFollowRequest(
  requestId: string,
): Promise<void> {
  const res = await fetch(
    `${API_BASE}/follows/requests/${requestId}/approve`,
    {
      method: 'POST',
      credentials: 'include', // 🔒 HttpOnly cookie
      headers: { Accept: 'application/json' },
    },
  );

  if (!res.ok) {
    if (res.status === 401)
      throw new Error('UNAUTHORIZED');
    if (res.status === 403)
      throw new Error('FORBIDDEN');
    if (res.status === 404)
      throw new Error('REQUEST_NOT_FOUND');
    if (res.status === 409)
      throw new Error('FOLLOW_CONFLICT');
    throw new Error('APPROVE_FOLLOW_REQUEST_FAILED');
  }
}

// ================================
// Reject follow request
// POST /api/follows/requests/:requestId/reject
// ================================
export async function rejectFollowRequest(
  requestId: string,
): Promise<void> {
  const res = await fetch(
    `${API_BASE}/follows/requests/${requestId}/reject`,
    {
      method: 'POST',
      credentials: 'include', // 🔒 HttpOnly cookie
      headers: { Accept: 'application/json' },
    },
  );

  if (!res.ok) {
    if (res.status === 401)
      throw new Error('UNAUTHORIZED');
    if (res.status === 403)
      throw new Error('FORBIDDEN');
    if (res.status === 404)
      throw new Error('REQUEST_NOT_FOUND');
    throw new Error('REJECT_FOLLOW_REQUEST_FAILED');
  }
}
