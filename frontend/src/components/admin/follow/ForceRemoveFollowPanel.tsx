// frontend/src/components/admin/follow/ForceRemoveFollowPanel.tsx

"use client";

import { useState } from "react";
import {
  useForceRemoveFollow,
} from "@/hooks/useForceRemoveFollow";
import type {
  ForceRemoveFollowReason,
} from "@/lib/api/admin-follows-moderation";

type Props = {
  followId: string;
};

const REASONS: {
  value: ForceRemoveFollowReason;
  label: string;
}[] = [
  { value: "HARASSMENT", label: "Harassment" },
  { value: "SPAM", label: "Spam" },
  { value: "SCAM", label: "Scam" },
  {
    value: "POLICY_VIOLATION",
    label: "Policy violation",
  },
  { value: "OTHER", label: "Other" },
];

export default function ForceRemoveFollowPanel({
  followId,
}: Props) {
  const { submit, loading, error, success } =
    useForceRemoveFollow();

  const [reason, setReason] =
    useState<ForceRemoveFollowReason>(
      "POLICY_VIOLATION",
    );
  const [note, setNote] = useState("");

  async function handleSubmit() {
    await submit({
      followId,
      reason,
      note,
    });
  }

  if (success) {
    return (
      <div className="rounded-lg border p-4 text-green-700">
        Follow relationship has been removed.
      </div>
    );
  }

  return (
    <section className="rounded-xl border p-4 space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">
          Reason
        </label>
        <select
          value={reason}
          onChange={(e) =>
            setReason(
              e.target
                .value as ForceRemoveFollowReason,
            )
          }
          className="w-full rounded border px-3 py-2 text-sm"
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
        <label className="block text-sm font-medium mb-1">
          Note (optional)
        </label>
        <textarea
          value={note}
          onChange={(e) =>
            setNote(e.target.value)
          }
          rows={3}
          className="w-full rounded border px-3 py-2 text-sm"
        />
      </div>

      {error && (
        <p className="text-sm text-red-600">
          {error}
        </p>
      )}

      <button
        type="button"
        onClick={handleSubmit}
        disabled={loading}
        className="
          rounded-lg bg-red-600 px-4 py-2 text-sm text-white
          hover:bg-red-700 disabled:opacity-50
        "
      >
        {loading
          ? "Processing..."
          : "Force Remove Follow"}
      </button>
    </section>
  );
}
