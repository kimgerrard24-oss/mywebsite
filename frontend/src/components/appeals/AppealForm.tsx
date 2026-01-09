// frontend/src/components/appeals/AppealForm.tsx

import { useState } from "react";
import type { AppealTargetType } from "@/types/appeal";

type Props = {
  targetType: AppealTargetType;
  targetId: string;

  onSubmit: (data: {
    reason: string;
    detail?: string;
  }) => Promise<void>;

  onCancel: () => void;

  /** UX only — parent can control loading */
  loading?: boolean;
};

export default function AppealForm({
  targetType,
  targetId,
  onSubmit,
  onCancel,
  loading = false,
}: Props) {
  const [reason, setReason] = useState("");
  const [detail, setDetail] = useState("");
  const [submitting, setSubmitting] =
    useState(false);
  const [error, setError] =
    useState<string | null>(null);

  const isSubmitting = loading || submitting;

  async function handleSubmit(
    e: React.FormEvent
  ) {
    e.preventDefault();

    if (isSubmitting) return;

    setError(null);

    if (reason.trim().length < 3) {
      setError("Please provide a valid reason.");
      return;
    }

    try {
      setSubmitting(true);

      await onSubmit({
        reason: reason.trim(),
        detail: detail.trim() || undefined,
      });
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          "Failed to submit appeal"
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4"
      aria-label="Appeal form"
    >
      {/* backend is authority — hidden inputs are only for semantics */}
      <input
        type="hidden"
        name="targetType"
        value={targetType}
      />
      <input
        type="hidden"
        name="targetId"
        value={targetId}
      />

      <div>
        <label
          htmlFor="appeal-reason"
          className="block text-sm font-medium"
        >
          Reason
        </label>
        <textarea
          id="appeal-reason"
          required
          minLength={3}
          rows={3}
          className="
            mt-1 w-full rounded border p-2
            focus:outline-none focus:ring-2
            focus:ring-blue-500
          "
          value={reason}
          onChange={(e) =>
            setReason(e.target.value)
          }
          disabled={isSubmitting}
        />
      </div>

      <div>
        <label
          htmlFor="appeal-detail"
          className="block text-sm font-medium"
        >
          Additional details (optional)
        </label>
        <textarea
          id="appeal-detail"
          rows={4}
          className="
            mt-1 w-full rounded border p-2
            focus:outline-none focus:ring-2
            focus:ring-blue-500
          "
          value={detail}
          onChange={(e) =>
            setDetail(e.target.value)
          }
          disabled={isSubmitting}
        />
      </div>

      {error && (
        <p
          role="alert"
          className="text-sm text-red-600"
        >
          {error}
        </p>
      )}

      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className="
            rounded border px-4 py-2 text-sm
            hover:bg-gray-100
            disabled:opacity-60
          "
        >
          Cancel
        </button>

        <button
          type="submit"
          disabled={isSubmitting}
          className="
            rounded bg-blue-600 px-4 py-2
            text-sm text-white hover:bg-blue-700
            disabled:opacity-60
          "
        >
          {isSubmitting
            ? "Submitting..."
            : "Submit Appeal"}
        </button>
      </div>
    </form>
  );
}

