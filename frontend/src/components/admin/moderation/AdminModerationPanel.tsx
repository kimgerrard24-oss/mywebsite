// frontend/src/components/admin/moderation/AdminModerationPanel.tsx

import { useState } from "react";
import { useCreateModerationAction } from "@/hooks/useCreateModerationAction";
import AdminModerationForm from "./AdminModerationForm";
import AdminModerationConfirmModal from "./AdminModerationConfirmModal";
import type {
  ModerationTargetType,
  ModerationActionType,
} from "@/types/moderation-action";

/**
 * Human-readable label for confirmation UI
 * (UX only — backend is authority)
 */
function assertNever(x: never): never {
  throw new Error(`Unhandled action: ${x}`);
}

function renderActionLabel(
  action: ModerationActionType,
): string {
  switch (action) {
    case "HIDE":
      return "hide this content";
    case "UNHIDE":
      return "unhide this content";
    case "BAN_USER":
      return "ban this user";
    case "DELETE":
      return "delete this content";
    case "WARN":
      return "warn this user";
    case "NO_ACTION":
      return "mark as no action";
    default:
      return assertNever(action);
  }
}


type Props = {
  targetType: ModerationTargetType;
  targetId: string;
};

export default function AdminModerationPanel({
  targetType,
  targetId,
}: Props) {
  const { submit, loading, error } =
    useCreateModerationAction();

  const [pending, setPending] =
    useState<{
      actionType: ModerationActionType;
      reason: string;
    } | null>(null);

  return (
    <section className="rounded border p-4 space-y-3">
      <h3 className="font-medium">
        Moderation
      </h3>

      {/* ===== Moderation form ===== */}
      <AdminModerationForm
        targetType={targetType}
        targetId={targetId}
        loading={loading}
        onConfirm={(data) =>
          setPending(data)
        }
      />

      {/* ===== Confirm modal ===== */}
      <AdminModerationConfirmModal
        open={!!pending}
        actionLabel={
          pending
            ? renderActionLabel(
                pending.actionType,
              )
            : ""
        }
        onCancel={() =>
          setPending(null)
        }
        onConfirm={async () => {
          if (!pending || loading) return;

          try {
            await submit({
              targetType,
              targetId,
              ...pending,
            });
          } finally {
            // production-safe: always close modal
            setPending(null);
          }
        }}
      />

      {/* ===== Status ===== */}
      {loading && (
        <p className="text-sm text-gray-500">
          Processing…
        </p>
      )}

      {error && (
        <p className="text-sm text-red-600">
          {error}
        </p>
      )}
    </section>
  );
}
