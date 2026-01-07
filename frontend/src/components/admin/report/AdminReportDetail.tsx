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

  const snapshot = report.targetSnapshot;

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

      {/* ===== Target Snapshot (Admin Evidence) ===== */}
      {snapshot && (
        <section className="rounded border bg-gray-50 p-3 space-y-2">
          <h3 className="text-sm font-medium text-gray-700">
            Reported Content
          </h3>

          {snapshot.type === "POST" && (
            <div className="space-y-2 text-sm">
              <div className="text-gray-800 whitespace-pre-wrap">
                {snapshot.content}
              </div>

              <div className="flex flex-wrap gap-4 text-xs text-gray-500">
                <span>
                  By{" "}
                  {snapshot.author.displayName ??
                    snapshot.author.username}
                </span>
                <span>
                  {new Date(
                    snapshot.createdAt,
                  ).toLocaleString()}
                </span>
                <span>
                  Comments:{" "}
                  {snapshot.stats.commentCount}
                </span>
                <span>
                  Likes:{" "}
                  {snapshot.stats.likeCount}
                </span>
              </div>

              {(snapshot.isHidden ||
                snapshot.isDeleted) && (
                <p className="text-xs text-orange-600">
                  This post is currently hidden or
                  deleted.
                </p>
              )}
            </div>
          )}

          {snapshot.type === "COMMENT" && (
            <div className="space-y-2 text-sm">
              <div className="text-gray-800 whitespace-pre-wrap">
                {snapshot.content}
              </div>

              <div className="flex flex-wrap gap-4 text-xs text-gray-500">
                <span>
                  By{" "}
                  {snapshot.author.displayName ??
                    snapshot.author.username}
                </span>
                <span>
                  {new Date(
                    snapshot.createdAt,
                  ).toLocaleString()}
                </span>
                <span>
                  Post ID: {snapshot.post.id}
                </span>
              </div>

              {(snapshot.isHidden ||
                snapshot.isDeleted) && (
                <p className="text-xs text-orange-600">
                  This comment is currently hidden
                  or deleted.
                </p>
              )}
            </div>
          )}

          {snapshot.type === "USER" && (
            <div className="space-y-1 text-sm">
              <p>
                Username: {snapshot.username}
              </p>
              {snapshot.displayName && (
                <p>
                  Display name:{" "}
                  {snapshot.displayName}
                </p>
              )}
              <p className="text-xs text-gray-500">
                Joined{" "}
                {new Date(
                  snapshot.createdAt,
                ).toLocaleDateString()}
              </p>

              {snapshot.isDisabled && (
                <p className="text-xs text-orange-600">
                  This user is currently disabled.
                </p>
              )}
            </div>
          )}

          {snapshot.type === "CHAT_MESSAGE" && (
            <div className="space-y-2 text-sm">
              <div className="text-gray-800 whitespace-pre-wrap">
                {snapshot.content}
              </div>

              <div className="flex flex-wrap gap-4 text-xs text-gray-500">
                <span>
                  By{" "}
                  {snapshot.sender.displayName ??
                    snapshot.sender.username}
                </span>
                <span>
                  {new Date(
                    snapshot.createdAt,
                  ).toLocaleString()}
                </span>
              </div>

              {snapshot.isDeleted && (
                <p className="text-xs text-orange-600">
                  This message is deleted.
                </p>
              )}
            </div>
          )}
        </section>
      )}

      {/* ===== Target Preview (quick admin navigation) ===== */}
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

