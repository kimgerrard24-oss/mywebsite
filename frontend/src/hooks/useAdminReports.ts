// frontend/src/hooks/useAdminReports.ts

import { useRef, useState } from "react";
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
  const [error, setError] = useState<
    Error | null
  >(null);

  /**
   * Prevent race condition
   */
  const requestIdRef = useRef(0);

  async function reload(
    query?: AdminReportQuery,
  ) {
    const requestId =
      ++requestIdRef.current;

    setLoading(true);
    setError(null);

    try {
      const res = await fetchAdminReports(
        { query },
      );

      // ignore outdated response
      if (
        requestId !==
        requestIdRef.current
      ) {
        return;
      }

      setData(res);
    } catch (err: any) {
      if (
        requestId !==
        requestIdRef.current
      ) {
        return;
      }

      // expose backend error
      setError(err);
    } finally {
      if (
        requestId ===
        requestIdRef.current
      ) {
        setLoading(false);
      }
    }
  }

  return {
    data,
    loading,
    error,
    reload,
  };
}
