// frontend/src/components/admin/report/AdminReportFilter.tsx

import type {
  AdminReportQuery,
  ReportStatus,
} from "@/types/admin-report";

type Props = {
  onChange: (query: AdminReportQuery) => void;
};

export default function AdminReportFilter({
  onChange,
}: Props) {
  function onStatusChange(
    e: React.ChangeEvent<HTMLSelectElement>,
  ) {
    const value = e.target.value as
      | ReportStatus
      | "";

    /**
     * UX only:
     * - empty string => All
     * - backend is authority
     */
    onChange({
      status: value || undefined,
      page: 1,
    });
  }

  return (
    <div className="flex items-center gap-2">
      <label className="text-sm">Status</label>

      <select
        onChange={onStatusChange}
        className="rounded border px-2 py-1 text-sm"
      >
        <option value="">All</option>
        <option value="PENDING">Pending</option>
        <option value="REVIEWED">Reviewed</option>
        <option value="ACTION_TAKEN">
          Action taken
        </option>
        <option value="REJECTED">Rejected</option>
        <option value="WITHDRAWN">
          Withdrawn
        </option>
      </select>
    </div>
  );
}
