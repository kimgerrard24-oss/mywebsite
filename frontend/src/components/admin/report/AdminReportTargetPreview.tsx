import Link from "next/link";
import type { ReportTargetType } from "@/types/admin-report";
import { renderReportTargetLabel } from "@/utils/renderReportTargetLabel";

type Props = {
  targetType: ReportTargetType;
  targetId: string;
};

export default function AdminReportTargetPreview({
  targetType,
  targetId,
}: Props) {
  return (
    <section className="rounded border bg-gray-50 p-3 text-sm space-y-1">
      <p className="font-medium text-gray-700">
        Target
      </p>

      <p className="text-gray-600">
        {renderReportTargetLabel(targetType)} —{" "}
        <span className="font-mono">
          {targetId}
        </span>
      </p>

      {/* ===== Admin quick navigation (best-effort) ===== */}
      <div className="pt-1 text-xs">
        {targetType === "POST" && (
          <Link
            href={`/admin/posts/${targetId}`}
            className="text-blue-600 hover:underline"
          >
            View post
          </Link>
        )}

        {targetType === "COMMENT" && (
          <Link
            href={`/admin/comments/${targetId}`}
            className="text-blue-600 hover:underline"
          >
            View comment
          </Link>
        )}

        {targetType === "USER" && (
          <Link
            href={`/admin/users/${targetId}`}
            className="text-blue-600 hover:underline"
          >
            View user
          </Link>
        )}

        {targetType === "CHAT_MESSAGE" && (
          <span className="text-gray-500 italic">
            Chat message preview not available
          </span>
        )}
      </div>
    </section>
  );
}
