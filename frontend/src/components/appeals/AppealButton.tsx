// frontend/src/components/appeals/AppealButton.tsx

import { useState, useCallback } from "react";
import AppealModal from "./AppealModal";
import { createAppeal } from "@/lib/api/appeals";
import type { AppealTargetType } from "@/types/appeal";

type Props = {
  targetType: AppealTargetType;
  targetId: string;

  /**
   * UX guard only — source of truth from backend
   * true = target has active moderation effect
   */
  canAppeal: boolean;
};

export default function AppealButton({
  targetType,
  targetId,
  canAppeal,
}: Props) {
  const [open, setOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = useCallback(
    async (data: { reason: string; detail?: string }) => {
      if (loading) return; // hard guard

      setLoading(true);
      setError(null);

      try {
        await createAppeal({
          targetType,
          targetId,
          reason: data.reason,
          detail: data.detail,
        });

        // backend accepted → lock UX
        setSubmitted(true);
        setOpen(false);
      } catch (err: any) {
        /**
         * backend is authority:
         * - target already unhidden
         * - no moderation action
         * - duplicate appeal
         */
        const message =
          err?.response?.data?.message ||
          "Unable to submit appeal";

        setError(message);
      } finally {
        setLoading(false);
      }
    },
    [loading, targetType, targetId],
  );

  /**
   * ===== UX guards (frontend only) =====
   */

  // already appealed in this session
  if (submitted) {
    return (
      <span
        className="text-xs text-gray-500"
        aria-live="polite"
      >
        Appeal submitted
      </span>
    );
  }

  // backend says cannot appeal
  if (!canAppeal) {
    return (
      <span
        className="text-xs text-gray-400"
        aria-disabled="true"
      >
        Appeal not available
      </span>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={() => {
          if (!loading) setOpen(true);
        }}
        className="
          text-xs text-blue-600 hover:underline
          disabled:opacity-50 disabled:cursor-not-allowed
        "
        disabled={loading}
        aria-haspopup="dialog"
        aria-expanded={open}
      >
        Appeal decision
      </button>

      <AppealModal
        open={open}
        targetType={targetType}
        targetId={targetId}
        onSubmit={handleSubmit}
        onClose={() => {
          setOpen(false);
          setError(null);
        }}
        loading={loading}
        error={error}
      />
    </>
  );
}
