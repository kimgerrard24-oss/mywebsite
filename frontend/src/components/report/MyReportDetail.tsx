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
  const snapshot = report.targetSnapshot;

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

      {/* ===== Target Snapshot (read-only, backend authority) ===== */}
      {snapshot &&
        snapshot.type === report.targetType && (
          <section className="mt-4 rounded border bg-gray-50 p-3 text-sm space-y-2">
            <p className="font-medium text-gray-700">
              Reported content
            </p>

            {snapshot.type === "POST" && (
              <div className="space-y-1">
                <p className="text-gray-800 whitespace-pre-wrap">
                  {snapshot.content}
                </p>

                <p className="text-xs text-gray-500">
                  By{" "}
                  {snapshot.author.displayName ??
                    snapshot.author.username}{" "}
                  ·{" "}
                  {new Date(
                    snapshot.createdAt,
                  ).toLocaleString()}
                </p>

                {(snapshot.isHidden ||
                  snapshot.isDeleted) && (
                  <p className="text-xs text-red-600">
                    This post is no longer visible
                  </p>
                )}
              </div>
            )}

            {snapshot.type === "COMMENT" && (
              <div className="space-y-1">
                <p className="text-gray-800 whitespace-pre-wrap">
                  {snapshot.content}
                </p>

                <p className="text-xs text-gray-500">
                  By{" "}
                  {snapshot.author.displayName ??
                    snapshot.author.username}{" "}
                  ·{" "}
                  {new Date(
                    snapshot.createdAt,
                  ).toLocaleString()}
                </p>

                {(snapshot.isHidden ||
                  snapshot.isDeleted) && (
                  <p className="text-xs text-red-600">
                    This comment is no longer visible
                  </p>
                )}
              </div>
            )}

            {snapshot.type === "USER" && (
              <div className="space-y-1">
                <p>
                  <strong>User:</strong>{" "}
                  {snapshot.displayName ??
                    snapshot.username}
                </p>

                {snapshot.isDisabled && (
                  <p className="text-xs text-red-600">
                    This user is disabled
                  </p>
                )}
              </div>
            )}

            {snapshot.type === "CHAT_MESSAGE" && (
              <div className="space-y-1">
                <p className="text-gray-800 whitespace-pre-wrap">
                  {snapshot.content}
                </p>

                <p className="text-xs text-gray-500">
                  By{" "}
                  {snapshot.sender.displayName ??
                    snapshot.sender.username}{" "}
                  ·{" "}
                  {new Date(
                    snapshot.createdAt,
                  ).toLocaleString()}
                </p>

                {snapshot.isDeleted && (
                  <p className="text-xs text-red-600">
                    This message is deleted
                  </p>
                )}
              </div>
            )}
          </section>
        )}

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


