// frontend/src/hooks/useModeratedPost.ts

import { useEffect, useState } from 'react';
import type { ModeratedPostDetail } from '@/types/moderation';
import { getMyModeratedPostClient } from '@/lib/api/moderation';

export function useModeratedPost(postId: string) {
  const [data, setData] =
    useState<ModeratedPostDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;

    setLoading(true);
    getMyModeratedPostClient(postId)
      .then((d) => alive && setData(d))
      .finally(() => alive && setLoading(false));

    return () => {
      alive = false;
    };
  }, [postId]);

  return { data, loading };
}
