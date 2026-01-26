// frontend/src/hooks/usePostTagActions.ts

"use client";

import { useState } from "react";
import { acceptPostTag } from "@/lib/api/post-tags-accept";
import { rejectPostTag } from "@/lib/api/post-tags-reject";

export function usePostTagActions() {
  const [loading, setLoading] = useState(false);

  async function accept(params: {
    postId: string;
    tagId: string;
  }) {
    setLoading(true);
    try {
      return await acceptPostTag(params);
    } finally {
      setLoading(false);
    }
  }

  async function reject(params: {
    postId: string;
    tagId: string;
  }) {
    setLoading(true);
    try {
      return await rejectPostTag(params);
    } finally {
      setLoading(false);
    }
  }

  return { accept, reject, loading };
}
