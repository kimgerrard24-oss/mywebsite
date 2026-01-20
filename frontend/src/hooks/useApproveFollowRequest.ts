// frontend/src/hooks/useApproveFollowRequest.ts

'use client';

import { useState } from 'react';
import { approveFollowRequest } from '@/lib/api/followRequests';

export function useApproveFollowRequest() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(
    null,
  );

  async function approve(requestId: string) {
    if (loading) return;

    setLoading(true);
    setError(null);

    try {
      await approveFollowRequest(requestId);
      return true;
    } catch (e: any) {
      setError(
        e?.message ??
          'APPROVE_FOLLOW_REQUEST_FAILED',
      );
      return false;
    } finally {
      setLoading(false);
    }
  }

  return {
    approve,
    loading,
    error,
  };
}
