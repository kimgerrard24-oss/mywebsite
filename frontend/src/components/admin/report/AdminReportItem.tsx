// frontend/src/components/admin/report/AdminReportItem.tsx

import type { AdminReportItem as Report } from "@/types/admin-report";

type Props = {
  report: Report;
};

export default function AdminReportItem({
  report,
}: Props) {
  return (
    <li className="p-4">
      <div className="flex justify-between">
        <div>
          <p className="text-sm font-medium">
            {report.targetType} — {report.reason}
          </p>
          <p className="text-xs text-gray-500">
            Reported by{" "}
            {report.reporter.displayName ??
              report.reporter.username}
          </p>
        </div>

        <span className="rounded bg-gray-100 px-2 py-1 text-xs">
          {report.status}
        </span>
      </div>
    </li>
  );
}
