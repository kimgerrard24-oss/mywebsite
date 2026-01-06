// frontend/src/components/admin/report/AdminReportItem.tsx

import type { AdminReportItem as Report } from "@/types/admin-report";
import { renderReportTargetLabel } from "@/utils/renderReportTargetLabel";

/**
 * ===== Status presentation (UI only) =====
 * Backend is authority for actual status
 */
function renderStatusBadge(status: Report["status"]) {
  switch (status) {
    case "PENDING":
      return {
        label: "Pending",
        className: "bg-yellow-100 text-yellow-800",
      };
    case "REVIEWED":
      return {
        label: "Reviewed",
        className: "bg-blue-100 text-blue-800",
      };
    case "ACTION_TAKEN":
      return {
        label: "Action taken",
        className: "bg-green-100 text-green-800",
      };
    case "REJECTED":
      return {
        label: "Rejected",
        className: "bg-gray-200 text-gray-700",
      };
    case "WITHDRAWN":
      return {
        label: "Withdrawn",
        className: "bg-gray-100 text-gray-500",
      };
    default:
      return {
        label: status,
        className: "bg-gray-100 text-gray-700",
      };
  }
}

type Props = {
  report: Report;
};

export default function AdminReportItem({
  report,
}: Props) {
  const statusBadge = renderStatusBadge(
    report.status,
  );

  return (
    <li className="border-b p-4 last:border-b-0">
      <div className="flex items-start justify-between gap-4">
        {/* ===== Main info ===== */}
        <div className="min-w-0">
          <p className="text-sm font-medium text-gray-900">
            {renderReportTargetLabel(
              report.targetType,
            )}{" "}
            — {report.reason}
          </p>

          <p className="mt-0.5 text-xs text-gray-500">
            Reported by{" "}
            {report.reporter.displayName ??
              report.reporter.username}
          </p>
        </div>

        {/* ===== Status badge ===== */}
        <span
          className={[
            "shrink-0 rounded px-2 py-1 text-xs font-medium",
            statusBadge.className,
          ].join(" ")}
        >
          {statusBadge.label}
        </span>
      </div>
    </li>
  );
}
