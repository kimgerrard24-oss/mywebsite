// frontend/src/components/admin/report/AdminReportDetail.tsx

import type { AdminReportDetail } from "@/types/admin-report";
import AdminReportTargetPreview from "./AdminReportTargetPreview";
import AdminModerationPanel from "@/components/admin/moderation/AdminModerationPanel";

type Props = {
  report: AdminReportDetail;
};

export default function AdminReportDetail({
  report,
}: Props) {
  /**
   * Moderation allowed only for actionable states
   * (UX guard only — backend is authority)
   */
  const canModerate =
    report.status === "PENDING" ||
    report.status === "REVIEWED";

  /**
   * Target hidden state (UX guard only)
   *
   * Backend is authority.
   * At this stage, ACTION_TAKEN is the only safe signal
   * that content was moderated (e.g. HIDE).
   */
  const isHidden =
    report.status === "ACTION_TAKEN";

  return (
    <section className="space-y-6 rounded border p-4">
      {/* ===== Reason ===== */}
      <div>
        <h2 className="text-sm font-medium">
          Reason
        </h2>
        <p className="text-sm text-gray-700">
          {report.reason}
        </p>
      </div>

      {/* ===== Description ===== */}
      {report.description && (
        <div>
          <h2 className="text-sm font-medium">
            Description
          </h2>
          <p className="text-sm text-gray-700">
            {report.description}
          </p>
        </div>
      )}

      {/* ===== Meta ===== */}
      <div className="flex flex-wrap gap-4 text-sm text-gray-600">
        <span>Status: {report.status}</span>
        <span>
          Reported by{" "}
          {report.reporter.displayName ??
            report.reporter.username}
        </span>
      </div>

      {/* ===== Target Preview (read-only) ===== */}
      <AdminReportTargetPreview
        targetType={report.targetType}
        targetId={report.targetId}
      />

      {/* ===== Moderation Action ===== */}
      {canModerate && (
        <AdminModerationPanel
          targetType={report.targetType}
          targetId={report.targetId}
          isHidden={isHidden}
        />
      )}
    </section>
  );
}
