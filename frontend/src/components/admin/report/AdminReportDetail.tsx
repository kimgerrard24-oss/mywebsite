// frontend/src/components/admin/report/AdminReportDetail.tsx

import type { AdminReportDetail } from "@/types/admin-report";
import AdminReportTargetPreview from "./AdminReportTargetPreview";

type Props = {
  report: AdminReportDetail;
};

export default function AdminReportDetail({
  report,
}: Props) {
  return (
    <section className="space-y-4 rounded border p-4">
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
      <div className="flex gap-4 text-sm text-gray-600">
        <span>Status: {report.status}</span>
        <span>
          Reported by{" "}
          {report.reporter.displayName ??
            report.reporter.username}
        </span>
      </div>

      {/* ===== Target Preview (single responsibility) ===== */}
      <AdminReportTargetPreview
        targetType={report.targetType}
        targetId={report.targetId}
      />
    </section>
  );
}
