// frontend/src/hooks/usePostTags.ts

import { useEffect, useState } from "react";
import { getPostTags } from "@/lib/api/post-tags";
import type { PostUserTagItem } from "@/types/post-user-tag";

export function usePostTags(postId: string) {
  const [items, setItems] = useState<PostUserTagItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  async function load() {
    try {
      setLoading(true);
      const data = await getPostTags({ postId });
      setItems(data);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [postId]);

  return {
    items,
    loading,
    error,
    reload: load,
    setItems, // for optimistic updates if needed
  };
}
