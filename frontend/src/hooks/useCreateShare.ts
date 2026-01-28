// frontend/src/hooks/useCreateShare.ts

import { useState } from "react";
import {
  createShare,
  CreateSharePayload,
} from "@/lib/api/shares";

export function useCreateShare() {
  const [loading, setLoading] =
    useState(false);
  const [error, setError] =
    useState<string | null>(null);

  const submit = async (
    payload: CreateSharePayload,
  ) => {
    try {
      setLoading(true);
      setError(null);

      const res = await createShare(payload);
      return res;
    } catch (err: any) {
      setError(
        err?.response?.data?.message ??
          "Failed to share post",
      );
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    submit,
    loading,
    error,
  };
}
