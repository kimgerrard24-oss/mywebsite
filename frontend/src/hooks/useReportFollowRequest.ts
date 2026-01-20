// frontend/src/hooks/useReportFollowRequest.ts

'use client';

import { useState } from 'react';
import {
  reportFollowRequest,
  type FollowRequestReportReason,
} from '@/lib/api/followRequestReports';

export function useReportFollowRequest() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(
    null,
  );

  async function submit(params: {
    followRequestId: string;
    reason: FollowRequestReportReason;
    note?: string;
  }): Promise<boolean> {
    setLoading(true);
    setError(null);

    try {
      await reportFollowRequest(
        params.followRequestId,
        {
          reason: params.reason,
          note: params.note,
        },
      );

      return true;
    } catch (err: any) {
      setError(
        err?.message ||
          'REPORT_FOLLOW_REQUEST_FAILED',
      );
      return false;
    } finally {
      setLoading(false);
    }
  }

  return {
    submit,
    loading,
    error,
  };
}
