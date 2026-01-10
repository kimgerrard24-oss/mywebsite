// frontend/src/hooks/useModeratedMessage.ts

import { useEffect, useState } from "react";
import type { ModeratedMessageDetail } from "@/types/moderation";
import { getModeratedMessage } from "@/lib/api/moderation";

export function useModeratedMessage(id?: string) {
  const [data, setData] =
    useState<ModeratedMessageDetail | null>(null);
  const [loading, setLoading] =
    useState<boolean>(true);

  useEffect(() => {
    if (!id) return;

    let mounted = true;

    setLoading(true);

    getModeratedMessage(id)
      .then((res) => {
        if (!mounted) return;

        if (res && res.message) {
          setData(res.message);
        } else {
          setData(null);
        }
      })
      .catch(() => {
        if (mounted) setData(null);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [id]);

  return { data, loading };
}


