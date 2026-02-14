// frontend/src/hooks/useProfileUpdateDraft.ts

"use client";

import { useState } from "react";
import { createProfileUpdateDraft } from "@/lib/api/profile-update";
import type {
  ProfileUpdateDraft,
  PostVisibility,
} from "@/types/profile-update";

export type CreateProfileUpdateDraftPayload = {
  mediaId: string;
  content?: string;
  visibility?: PostVisibility;
};

export function useProfileUpdateDraft() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createDraft = async (
    payload: CreateProfileUpdateDraftPayload,
  ): Promise<ProfileUpdateDraft | null> => {
    try {
      setLoading(true);
      setError(null);

      const draft = await createProfileUpdateDraft(payload);
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

