// frontend/src/components/admin/report/AdminReportList.tsx

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
    <section>
      <AdminReportFilter onChange={reload} />

      {loading && (
        <p className="mt-4 text-sm text-gray-500">
          Loading…
        </p>
      )}

      <ul className="mt-4 divide-y rounded-md border">
        {data.items.map((item) => (
          <AdminReportItem
            key={item.id}
            report={item}
          />
        ))}
      </ul>
    </section>
  );
}
