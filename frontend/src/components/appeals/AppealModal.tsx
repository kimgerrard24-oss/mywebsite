// frontend/src/components/appeals/AppealModal.tsx

import AppealForm from "./AppealForm";
import type { AppealTargetType } from "@/types/appeal";

type Props = {
  open: boolean;
  targetType: AppealTargetType;
  targetId: string;
  onSubmit: (data: {
    reason: string;
    detail?: string;
  }) => Promise<void>;
  onClose: () => void;
};

export default function AppealModal({
  open,
  targetType,
  targetId,
  onSubmit,
  onClose,
}: Props) {
  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="
        fixed inset-0 z-50
        flex items-center justify-center
        bg-black/40
      "
    >
      <div
        className="
          w-full max-w-md rounded bg-white p-4
        "
      >
        <h2 className="mb-2 text-lg font-semibold">
          Submit Appeal
        </h2>

        <AppealForm
          targetType={targetType}
          targetId={targetId}
          onSubmit={onSubmit}
          onCancel={onClose}
        />
      </div>
    </div>
  );
}
