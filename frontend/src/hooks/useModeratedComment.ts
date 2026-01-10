// frontend/src/hooks/useModeratedComment.ts

import { useEffect, useState } from 'react';
import type {
  ModeratedCommentDetail,
} from '@/types/moderation';
import {
  getMyModeratedCommentClient,
} from '@/lib/api/moderation';

export function useModeratedComment(commentId: string) {
  const [data, setData] =
    useState<ModeratedCommentDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;

    setLoading(true);
    getMyModeratedCommentClient(commentId)
      .then((d) => alive && setData(d))
      .finally(() => alive && setLoading(false));

    return () => {
      alive = false;
    };
  }, [commentId]);

  return { data, loading };
}
