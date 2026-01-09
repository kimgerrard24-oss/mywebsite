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

  if (decision) {
    return (
      <AdminResolveConfirmDialog
        decision={decision}
        onCancel={() => setDecision(null)}
        onConfirm={async () => {
          await resolveAppeal({
            appealId,
            decision,
            resolutionNote: note || undefined,
          });
          window.location.reload();
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
      />

      <div className="flex gap-2">
        <button
          onClick={() => setDecision("APPROVED")}
          className="rounded bg-green-600 px-3 py-1.5 text-sm text-white"
        >
          Approve
        </button>

        <button
          onClick={() => setDecision("REJECTED")}
          className="rounded bg-red-600 px-3 py-1.5 text-sm text-white"
        >
          Reject
        </button>
      </div>
    </div>
  );
}
