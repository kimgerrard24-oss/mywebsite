// frontend/src/hooks/useUpdateTagSettings.ts

import { useState } from "react";
import { updateMyTagSettings } from "@/lib/api/tag-settings";
import type { UpdateTagSettingsInput } from "@/types/tag-settings";

export function useUpdateTagSettings() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(input: UpdateTagSettingsInput) {
    setLoading(true);
    setError(null);

    try {
      const res = await updateMyTagSettings(input);
      return res;
    } catch (e: any) {
      setError(
        e?.response?.data?.message ??
          "Unable to update tag settings",
      );
      throw e;
    } finally {
      setLoading(false);
    }
  }

  return {
    submit,
    loading,
    error,
  };
}
