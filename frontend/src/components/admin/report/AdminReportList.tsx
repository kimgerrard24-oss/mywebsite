import Link from "next/link";
import AdminReportItem from "./AdminReportItem";
import AdminReportFilter from "./AdminReportFilter";
import { useAdminReports } from "@/hooks/useAdminReports";
import type { AdminReportListResponse } from "@/types/admin-report";

type Props = {
  initialData: AdminReportListResponse;
};

export default function AdminReportList({
  initialData,
}: Props) {
  const { data, reload, loading } =
    useAdminReports(initialData);

  return (
    <section aria-label="Admin reports list">
      {/* ===== Filter ===== */}
      <AdminReportFilter onChange={reload} />

      {/* ===== Loading ===== */}
      {loading && (
        <p className="mt-4 text-sm text-gray-500">
          Loading…
        </p>
      )}

      {/* ===== Empty state ===== */}
      {!loading && data.items.length === 0 && (
        <p className="mt-4 text-sm text-gray-500">
          No reports found
        </p>
      )}

      {/* ===== List ===== */}
      {data.items.length > 0 && (
        <ul className="mt-4 divide-y rounded-md border">
          {data.items.map((item) => (
            <li key={item.id}>
              <Link
                href={`/admin/reports/${item.id}`}
                className="block hover:bg-gray-50 transition-colors"
              >
                <AdminReportItem report={item} />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
