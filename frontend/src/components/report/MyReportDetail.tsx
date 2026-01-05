// frontend/src/components/report/MyReportDetail.tsx

import type { MyReportDetail } from "@/lib/api/reports";

type Props = {
  report: MyReportDetail;
};

export default function MyReportDetail({
  report,
}: Props) {
  return (
    <article className="rounded-md border p-4">
      <header className="mb-2">
        <h1 className="text-lg font-semibold">
          Report Detail
        </h1>
        <p className="text-sm text-gray-500">
          Target:{" "}
          {report.targetType.toLowerCase()} (
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
