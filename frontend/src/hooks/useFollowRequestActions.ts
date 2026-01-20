// frontend/src/hooks/useFollowRequestActions.ts

'use client';

import { useApproveFollowRequest } from './useApproveFollowRequest';
import { useRejectFollowRequest } from './useRejectFollowRequest';

export function useFollowRequestActions() {
  const approve = useApproveFollowRequest();
  const reject = useRejectFollowRequest();

  return {
    approve,
    reject,
    loading:
      approve.loading || reject.loading,
  };
}
