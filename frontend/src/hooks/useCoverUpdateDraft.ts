// frontend/src/hooks/useCoverUpdateDraft.ts

"use client";

import { useState } from "react";
import { createCoverUpdateDraft } from "@/lib/api/cover-update";
import type {
  CoverUpdateDraft,
  PostVisibility,
} from "@/types/cover-update";

export type CreateCoverUpdateDraftPayload = {
  mediaId: string;
  content?: string;
  visibility?: PostVisibility;
};

export function useCoverUpdateDraft() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createDraft = async (
    payload: CreateCoverUpdateDraftPayload,
  ): Promise<CoverUpdateDraft | null> => {
    try {
      setLoading(true);
      setError(null);

      const draft = await createCoverUpdateDraft(payload);
      return draft;
    } catch (err: any) {
      setError(
        err?.response?.data?.message ??
          err?.message ??
          "Failed to save draft",
      );
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { createDraft, loading, error };
}
