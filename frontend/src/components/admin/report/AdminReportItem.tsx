// frontend/src/components/admin/report/AdminReportItem.tsx

import type { AdminReportItem as Report } from "@/types/admin-report";
import { renderReportTargetLabel } from "@/utils/renderReportTargetLabel";

type Props = {
  report: Report;
};

export default function AdminReportItem({
  report,
}: Props) {
  return (
    <li className="border-b p-4 last:border-b-0">
      <div className="flex items-start justify-between gap-4">
        {/* ===== Main info ===== */}
        <div className="min-w-0">
          <p className="text-sm font-medium text-gray-900">
            {renderReportTargetLabel(report.targetType)} —{" "}
            {report.reason}
          </p>

          <p className="mt-0.5 text-xs text-gray-500">
            Reported by{" "}
            {report.reporter.displayName ??
              report.reporter.username}
          </p>
        </div>

        {/* ===== Status ===== */}
        <span
          className="
            shrink-0
            rounded
            bg-gray-100
            px-2
            py-1
            text-xs
            font-medium
            text-gray-700
          "
        >
          {report.status}
        </span>
      </div>
    </li>
  );
}

