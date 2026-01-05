// frontend/src/components/admin/moderation/AdminModerationPanel.tsx

import { useState } from "react";
import { useCreateModerationAction } from "@/hooks/useCreateModerationAction";
import AdminModerationForm from "./AdminModerationForm";
import AdminModerationConfirmModal from "./AdminModerationConfirmModal";
import type {
  ModerationTargetType,
  ModerationActionType,
} from "@/types/moderation-action";

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
    <section className="rounded border p-4">
      <h3 className="mb-2 font-medium">
        Moderation
      </h3>

      <AdminModerationForm
        targetType={targetType}
        targetId={targetId}
        onConfirm={(data) =>
          setPending(data)
        }
      />

      <AdminModerationConfirmModal
        open={!!pending}
        actionLabel={
          pending?.actionType ?? ""
        }
        onCancel={() =>
          setPending(null)
        }
        onConfirm={async () => {
          if (!pending) return;

          await submit({
            targetType,
            targetId,
            ...pending,
          });

          setPending(null);
        }}
      />

      {loading && (
        <p className="mt-2 text-sm">
          Processing…
        </p>
      )}

      {error && (
        <p className="mt-2 text-sm text-red-600">
          {error}
        </p>
      )}
    </section>
  );
}
