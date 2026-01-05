// frontend/src/components/admin/report/AdminReportStats.tsx

import type { AdminReportStats } from "@/lib/api/admin-report-stats";

type Props = {
  stats: AdminReportStats;
};

export default function AdminReportStats({
  stats,
}: Props) {
  return (
    <section className="space-y-6">
      <div className="rounded border p-4">
        <h2 className="text-sm font-medium text-gray-600">
          Total Reports
        </h2>
        <div className="mt-1 text-2xl font-semibold">
          {stats.total}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="rounded border p-4">
          <h3 className="mb-2 text-sm font-medium">
            By Status
          </h3>

          <ul className="space-y-1 text-sm">
            {Object.entries(stats.byStatus).map(
              ([status, count]) => (
                <li
                  key={status}
                  className="flex justify-between"
                >
                  <span>{status}</span>
                  <span>{count}</span>
                </li>
              ),
            )}
          </ul>
        </div>

        <div className="rounded border p-4">
          <h3 className="mb-2 text-sm font-medium">
            By Target
          </h3>

          <ul className="space-y-1 text-sm">
            {Object.entries(
              stats.byTargetType,
            ).map(([type, count]) => (
              <li
                key={type}
                className="flex justify-between"
              >
                <span>{type}</span>
                <span>{count}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="rounded border p-4">
        <h3 className="mb-2 text-sm font-medium">
          Activity
        </h3>

        <ul className="space-y-1 text-sm">
          <li className="flex justify-between">
            <span>Last 24 hours</span>
            <span>{stats.activity.last24h}</span>
          </li>
          <li className="flex justify-between">
            <span>Last 7 days</span>
            <span>{stats.activity.last7d}</span>
          </li>
        </ul>
      </div>
    </section>
  );
}
