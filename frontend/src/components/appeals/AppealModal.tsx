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

  /** UX only */
  loading?: boolean;
  error?: string | null;
};

export default function AppealModal({
  open,
  targetType,
  targetId,
  onSubmit,
  onClose,
  loading = false,
  error = null,
}: Props) {
  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="appeal-modal-title"
      className="
        fixed inset-0 z-50
        flex items-center justify-center
        bg-black/40
      "
    >
      <div
        className="
          w-full max-w-md
          rounded bg-white p-4
          shadow-lg
        "
      >
        <h2
          id="appeal-modal-title"
          className="mb-2 text-lg font-semibold"
        >
          Submit Appeal
        </h2>

        {/* ===== Error from backend (UX only) ===== */}
        {error && (
          <p className="mb-2 text-sm text-red-600">
            {error}
          </p>
        )}

        {/* ส่งต่อ loading ให้ form ใช้ disable ปุ่ม (UX only) */}
        <AppealForm
          targetType={targetType}
          targetId={targetId}
          onSubmit={onSubmit}
          onCancel={onClose}
          loading={loading}
        />
      </div>
    </div>
  );
}

