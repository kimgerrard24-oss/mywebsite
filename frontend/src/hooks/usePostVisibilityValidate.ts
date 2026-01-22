// frontend/src/hooks/usePostVisibilityValidate.ts

import { useEffect, useState } from 'react';
import { validatePostVisibility } from '@/lib/api/post-visibility';
import type { PostVisibilityDecision } from '@/types/post-visibility';

export function usePostVisibilityValidate(postId: string) {
  const [loading, setLoading] = useState(true);
  const [decision, setDecision] =
    useState<PostVisibilityDecision | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;

    async function run() {
      try {
        setLoading(true);
        setError(null);

        const res = await validatePostVisibility(postId);
        if (!alive) return;

        setDecision(res);
      } catch {
        if (!alive) return;
        setError('Unable to validate post visibility');
      } finally {
        if (!alive) return;
        setLoading(false);
      }
    }

    run();

    return () => {
      alive = false;
    };
  }, [postId]);

  return {
    loading,
    decision,
    error,
  };
}
