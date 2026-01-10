// frontend/src/components/admin/appeals/AdminResolveAppealForm.tsx

import { useState } from "react";
import { resolveAppeal } from "@/lib/api/admin-appeals";
import AdminResolveConfirmDialog from "./AdminResolveConfirmDialog";

type Props = {
  appealId: string;
};

export default function AdminResolveAppealForm({
  appealId,
}: Props) {
  const [note, setNote] = useState("");
  const [decision, setDecision] =
    useState<"APPROVED" | "REJECTED" | null>(
      null,
    );

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const [error, setError] = useState<
    string | null
  >(null);

  if (decision) {
    return (
      <AdminResolveConfirmDialog
        decision={decision}
        onCancel={() => {
          if (isSubmitting) return;
          setDecision(null);
        }}
        onConfirm={async () => {
          if (isSubmitting) return;

          try {
            setIsSubmitting(true);
            setError(null);

            await resolveAppeal({
              appealId,
              decision,
              resolutionNote: note || undefined,
            });

            /**
             * Backend is authority
             * reload to re-fetch resolved status
             */
            window.location.reload();
          } catch (e) {
            setError(
              "Failed to resolve appeal. Please try again.",
            );
            setIsSubmitting(false);
          }
        }}
      />
    );
  }

  return (
    <div className="space-y-2 border-t pt-3">
      <textarea
        value={note}
        onChange={(e) =>
          setNote(e.target.value)
        }
        placeholder="Resolution note (optional)"
        className="w-full rounded border p-2 text-sm"
        rows={3}
        disabled={isSubmitting}
      />

      {error && (
        <p className="text-sm text-red-600">
          {error}
        </p>
      )}

      <div className="flex gap-2">
        <button
          onClick={() => setDecision("APPROVED")}
          disabled={isSubmitting}
          className="rounded bg-green-600 px-3 py-1.5 text-sm text-white disabled:opacity-60"
        >
          Approve
        </button>

        <button
          onClick={() => setDecision("REJECTED")}
          disabled={isSubmitting}
          className="rounded bg-red-600 px-3 py-1.5 text-sm text-white disabled:opacity-60"
        >
          Reject
        </button>
      </div>
    </div>
  );
}

