// frontend/src/hooks/useCreateModerationAction.ts

import { useState } from "react";
import { createModerationAction } from "@/lib/api/admin-moderation";
import type {
  CreateModerationActionInput,
  ModerationActionResult,
} from "@/types/moderation-action";

/**
 * useCreateModerationAction
 *
 * Generic write-side hook for ADMIN moderation actions.
 *
 * Supported actions are defined by backend enum:
 * - HIDE
 * - UNHIDE
 * - BAN_USER
 * - DELETE
 * - WARN
 * - NO_ACTION
 *
 * IMPORTANT:
 * - Frontend MUST NOT derive permission (e.g. canUnhide)
 * - Backend is the sole authority
 * - This hook only triggers the request
 */
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
      /**
       * Backend validates:
       * - permission
       * - target existence
       * - state validity (e.g. UNHIDE allowed or not)
       */
      return await createModerationAction(input);
    } catch (err: any) {
      /**
       * Production-safe error handling
       * - Do not assume error shape
       * - Do not leak backend internals
       */
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
