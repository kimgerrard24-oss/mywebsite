// frontend/src/hooks/useRejectFollowRequest.ts

'use client';

import { useState } from 'react';
import { rejectFollowRequest } from '@/lib/api/followRequests';

export function useRejectFollowRequest() {
  const [loading, setLoading] = useState(false);
  const [error, setError] =
    useState<string | null>(null);

  async function reject(
    requestId: string,
  ): Promise<boolean> {
    if (loading) return false;

    setLoading(true);
    setError(null);

    try {
      await rejectFollowRequest(requestId);
      return true;
    } catch (err) {
      const e = err as Error;
      setError(e.message);
      return false;
    } finally {
      setLoading(false);
    }
  }

  return {
    reject,
    loading,
    error,
  };
}
