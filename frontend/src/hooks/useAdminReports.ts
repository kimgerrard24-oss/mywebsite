// frontend/src/hooks/useAdminReports.ts

import { useEffect, useState } from "react";
import { fetchAdminReports } from "@/lib/api/admin-reports";
import type {
  AdminReportListResponse,
  AdminReportQuery,
} from "@/types/admin-report";

export function useAdminReports(
  initialData: AdminReportListResponse,
) {
  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(false);

  async function reload(query?: AdminReportQuery) {
    setLoading(true);
    try {
      const res = await fetchAdminReports({
        query,
      });
      setData(res);
    } finally {
      setLoading(false);
    }
  }

  return {
    data,
    loading,
    reload,
  };
}
