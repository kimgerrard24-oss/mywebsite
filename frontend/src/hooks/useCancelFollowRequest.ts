// frontend/src/hooks/useCancelFollowRequest.ts

'use client';

import { useState, useCallback } from 'react';
import { cancelFollowRequest } from '@/lib/api/followRequests';

type State = {
  loading: boolean;
  error: string | null;
};

export function useCancelFollowRequest() {
  const [state, setState] = useState<State>({
    loading: false,
    error: null,
  });

  const cancel = useCallback(async (targetUserId: string) => {
    if (state.loading) return;

    setState({ loading: true, error: null });

    try {
      await cancelFollowRequest(targetUserId);
      setState({ loading: false, error: null });
      return true;
    } catch (err: any) {
      setState({
        loading: false,
        error:
          err?.message ??
          'CANCEL_FOLLOW_REQUEST_FAILED',
      });
      return false;
    }
  }, [state.loading]);

  return {
    cancel,
    loading: state.loading,
    error: state.error,
  };
}
