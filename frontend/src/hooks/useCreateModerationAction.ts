// frontend/src/hooks/useCreateModerationAction.ts

import { useState } from "react";
import { createModerationAction } from "@/lib/api/admin-moderation";
import type {
  CreateModerationActionInput,
  ModerationActionResult,
} from "@/types/moderation-action";

export function useCreateModerationAction() {
  const [loading, setLoading] = useState(false);
  const [error, setError] =
    useState<string | null>(null);

  const submit = async (
    input: CreateModerationActionInput,
  ): Promise<ModerationActionResult | null> => {
    setLoading(true);
    setError(null);

    try {
      return await createModerationAction(input);
    } catch (err: any) {
      setError(
        err?.body?.message ??
          "Failed to perform moderation action",
      );
      return null;
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
