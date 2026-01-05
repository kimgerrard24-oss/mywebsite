// frontend/src/components/report/MyReportItem.tsx

import type { MyReportItem } from "@/lib/api/reports";

type Props = {
  report: MyReportItem;
};

export default function MyReportItem({
  report,
}: Props) {
  return (
    <article className="rounded-md border p-3">
      <header className="mb-1 text-sm text-gray-600">
        Reported {report.targetType.toLowerCase()}
      </header>

      <p className="text-sm text-gray-900">
        Reason: {report.reason}
      </p>

      <footer className="mt-2 flex justify-between text-xs text-gray-500">
        <span>Status: {report.status}</span>
        <time dateTime={report.createdAt}>
          {new Date(
            report.createdAt,
          ).toLocaleString()}
        </time>
      </footer>
    </article>
  );
}
