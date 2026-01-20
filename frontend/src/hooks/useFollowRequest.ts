// frontend/src/hooks/useFollowRequest.ts

'use client';

import { useState, useCallback } from 'react';
import { sendFollowRequest } from '@/lib/api/followRequests';

export function useFollowRequest(targetUserId: string) {
  const [loading, setLoading] = useState(false);
  const [error, setError] =
    useState<string | null>(null);

  const request = useCallback(async () => {
    if (loading) return;

    setLoading(true);
    setError(null);

    try {
      await sendFollowRequest(targetUserId);
    } catch (err: any) {
      setError(
        err instanceof Error
          ? err.message
          : 'UNKNOWN_ERROR',
      );
      throw err;
    } finally {
      setLoading(false);
    }
  }, [targetUserId, loading]);

  return {
    request,
    loading,
    error,
  };
}
