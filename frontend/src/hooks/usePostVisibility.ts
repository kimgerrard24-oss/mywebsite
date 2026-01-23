// frontend/src/hooks/usePostVisibility.ts

'use client';

import { useState, useCallback, useRef } from 'react';
import { updatePostVisibility } from '@/lib/api/post-visibility';

export type PostVisibility =
  | 'PUBLIC'
  | 'FOLLOWERS'
  | 'PRIVATE'
  | 'CUSTOM';

export type PostVisibilityValue = {
  visibility: PostVisibility;
  includeUserIds?: string[];
  excludeUserIds?: string[];
};

type Params = {
  postId: string;
  initial: PostVisibilityValue;
};

export function usePostVisibility({
  postId,
  initial,
}: Params) {
  const [value, setValue] =
    useState<PostVisibilityValue>(initial);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // prevent race condition
  const requestSeq = useRef(0);

  const updateVisibility = useCallback(
    async (next: PostVisibilityValue) => {
      if (loading) return;

      const seq = ++requestSeq.current;

      setLoading(true);
      setError(null);

      try {
        const res = await updatePostVisibility(
          postId,
          next,
        );

        // ignore outdated responses
        if (seq !== requestSeq.current) return;

        if (res?.success === true) {
          setValue(next);
        } else {
          throw new Error(
            'Visibility update rejected',
          );
        }
      } catch (e) {
        if (seq !== requestSeq.current) return;

        console.error(
          '[usePostVisibility] update failed',
          e,
        );

        setError(
          'Unable to update post visibility. Please try again.',
        );
      } finally {
        if (seq === requestSeq.current) {
          setLoading(false);
        }
      }
    },
    [postId, loading],
  );

  return {
    value,
    loading,
    error,
    updateVisibility,
    setLocalValue: setValue, // still useful for future UX flows
  };
}
