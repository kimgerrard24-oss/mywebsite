// frontend/src/components/report/ReportDialog.tsx

"use client";

import ReportForm from "./ReportForm";

type Props = {
  targetType: "POST" | "COMMENT" | "USER";
  targetId: string;
  onClose: () => void;
};

export default function ReportDialog({
  targetType,
  targetId,
  onClose,
}: Props) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
    >
      <div className="w-full max-w-md rounded-md bg-white p-4 shadow-lg">
        <header className="mb-3">
          <h2 className="text-lg font-semibold">
            Report content
          </h2>
        </header>

        <ReportForm
          targetType={targetType}
          targetId={targetId}
          onSuccess={onClose}
          onCancel={onClose}
        />
      </div>
    </div>
  );
}
