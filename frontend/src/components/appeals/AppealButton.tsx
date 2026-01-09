// frontend/src/components/appeals/AppealButton.tsx

import { useState } from "react";
import AppealModal from "./AppealModal";
import { createAppeal } from "@/lib/api/appeals";
import type { AppealTargetType } from "@/types/appeal";

type Props = {
  targetType: AppealTargetType;
  targetId: string;
};

export default function AppealButton({
  targetType,
  targetId,
}: Props) {
  const [open, setOpen] = useState(false);
  const [submitted, setSubmitted] =
    useState(false);

  async function handleSubmit(data: {
    reason: string;
    detail?: string;
  }) {
    await createAppeal({
      targetType,
      targetId,
      reason: data.reason,
      detail: data.detail,
    });

    setSubmitted(true);
    setOpen(false);
  }

  if (submitted) {
    return (
      <span className="text-xs text-gray-500">
        Appeal submitted
      </span>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="
          text-xs text-blue-600 hover:underline
        "
      >
        Appeal decision
      </button>

      <AppealModal
        open={open}
        targetType={targetType}
        targetId={targetId}
        onSubmit={handleSubmit}
        onClose={() => setOpen(false)}
      />
    </>
  );
}
