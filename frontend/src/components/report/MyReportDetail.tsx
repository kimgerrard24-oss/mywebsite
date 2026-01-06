// frontend/src/components/report/MyReportDetail.tsx

import type { MyReportDetail } from "@/lib/api/reports";
import WithdrawReportButton from "./WithdrawReportButton";

type Props = {
  report: MyReportDetail;
};

/**
 * Explicit mapping for display only
 * (avoid calling string methods on union types)
 */
function renderTargetLabel(type: MyReportDetail["targetType"]) {
  switch (type) {
    case "POST":
      return "post";
    case "COMMENT":
      return "comment";
    case "USER":
      return "user";
    case "CHAT_MESSAGE":
      return "chat message";
    default:
      return "content";
  }
}

/**
 * UX guard only
 * Backend remains full authority
 */
function canWithdraw(status: MyReportDetail["status"]) {
  return status === "PENDING" || status === "REVIEWED";
}

export default function MyReportDetail({ report }: Props) {
  return (
    <article className="rounded-md border p-4">
      <header className="mb-2">
        <h1 className="text-lg font-semibold">
          Report Detail
        </h1>
        <p className="text-sm text-gray-500">
          Target{" "}
          {renderTargetLabel(report.targetType)} (
          {report.targetId})
        </p>
      </header>

      <section className="space-y-2 text-sm">
        <p>
          <strong>Reason:</strong>{" "}
          {report.reason}
        </p>

        {report.description && (
          <p>
            <strong>Description:</strong>{" "}
            {report.description}
          </p>
        )}

        <p>
          <strong>Status:</strong>{" "}
          {report.status}
        </p>
      </section>

      {canWithdraw(report.status) && (
        <div className="mt-4">
          <WithdrawReportButton
            reportId={report.id}
          />
        </div>
      )}

      <footer className="mt-4 text-xs text-gray-500">
        <time dateTime={report.createdAt}>
          Created at{" "}
          {new Date(
            report.createdAt,
          ).toLocaleString()}
        </time>
      </footer>
    </article>
  );
}
