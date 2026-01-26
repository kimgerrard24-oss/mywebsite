// frontend/src/hooks/useRemoveMyPostTag.ts

import { useState } from "react";
import { removeMyPostTag } from "@/lib/api/post-tags-me";

export function useRemoveMyPostTag() {
  const [loading, setLoading] = useState(false);

  async function submit(params: { postId: string }) {
    try {
      setLoading(true);
      return await removeMyPostTag(params);
    } finally {
      setLoading(false);
    }
  }

  return { submit, loading };
}
