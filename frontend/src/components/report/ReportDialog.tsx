// frontend/src/components/report/ReportDialog.tsx

"use client";

import ReportForm from "./ReportForm";
import { renderReportTargetLabel } from "@/utils/renderReportTargetLabel";

export type ReportTargetType =
  | "POST"
  | "COMMENT"
  | "USER"
  | "CHAT_MESSAGE";

type Props = {
  targetType: ReportTargetType;
  targetId: string;

  /**
   * Close dialog (after success or cancel)
   */
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
        {/* ===== Header ===== */}
        <header className="mb-2">
          <h2 className="text-lg font-semibold">
            Report content
          </h2>

          {/* ✅ Target info (UX clarity) */}
          <p className="mt-1 text-sm text-gray-500">
            Target{" "}
            {renderReportTargetLabel(targetType)}{" "}
            <span className="break-all text-gray-400">
              ({targetId})
            </span>
          </p>
        </header>

        {/* ===== Form ===== */}
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
