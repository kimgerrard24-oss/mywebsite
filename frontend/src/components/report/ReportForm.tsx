// frontend/src/components/report/ReportForm.tsx

"use client";

import { useState } from "react";
import { useCreateReport } from "@/hooks/useCreateReport";

type Props = {
  targetType: "POST" | "COMMENT" | "USER";
  targetId: string;
  onSuccess: () => void;
  onCancel: () => void;
};

const REASONS = [
  { value: "SPAM", label: "Spam" },
  {
    value: "HARASSMENT",
    label: "Harassment",
  },
  {
    value: "HATE_SPEECH",
    label: "Hate speech",
  },
  { value: "SCAM", label: "Scam" },
  { value: "NSFW", label: "NSFW" },
  {
    value: "MISINFORMATION",
    label: "Misinformation",
  },
  { value: "OTHER", label: "Other" },
] as const;

export default function ReportForm({
  targetType,
  targetId,
  onSuccess,
  onCancel,
}: Props) {
  const { execute, loading, error } =
    useCreateReport();

  const [reason, setReason] =
    useState<string>("SPAM");
  const [description, setDescription] =
    useState("");

  async function submit(
    e: React.FormEvent,
  ) {
    e.preventDefault();

    const ok = await execute({
      targetType,
      targetId,
      reason: reason as any,
      description:
        description.trim() || undefined,
    });

    if (ok) {
      onSuccess();
    }
  }

  return (
    <form
      onSubmit={submit}
      className="space-y-3"
    >
      <div>
        <label className="block text-sm font-medium">
          Reason
        </label>
        <select
          value={reason}
          onChange={(e) =>
            setReason(e.target.value)
          }
          className="mt-1 w-full rounded border px-2 py-1"
        >
          {REASONS.map((r) => (
            <option
              key={r.value}
              value={r.value}
            >
              {r.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium">
          Additional details (optional)
        </label>
        <textarea
          value={description}
          onChange={(e) =>
            setDescription(e.target.value)
          }
          maxLength={1000}
          rows={4}
          className="mt-1 w-full rounded border px-2 py-1"
        />
      </div>

      {error && (
        <p className="text-sm text-red-600">
          {error}
        </p>
      )}

      <footer className="flex justify-end gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="rounded px-3 py-1 text-sm"
        >
          Cancel
        </button>

        <button
          type="submit"
          disabled={loading}
          className="rounded bg-red-600 px-3 py-1 text-sm text-white disabled:opacity-60"
        >
          {loading
            ? "Submitting..."
            : "Submit report"}
        </button>
      </footer>
    </form>
  );
}
