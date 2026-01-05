// frontend/src/hooks/useMyReportDetail.ts

import { useCallback, useEffect, useState } from "react";
import {
  getMyReportById,
  type MyReportDetail,
} from "@/lib/api/reports";

type Params = {
  reportId: string;
};

export function useMyReportDetail({
  reportId,
}: Params) {
  const [data, setData] =
    useState<MyReportDetail | null>(null);
  const [loading, setLoading] =
    useState(false);
  const [error, setError] =
    useState<string | null>(null);

  const load = useCallback(async () => {
    if (!reportId || loading) return;

    setLoading(true);
    setError(null);

    try {
      const res = await getMyReportById(reportId);
      setData(res);
    } catch (err: any) {
      setError(
        err?.body?.message ??
          "Failed to load report",
      );
    } finally {
      setLoading(false);
    }
  }, [reportId, loading]);

  useEffect(() => {
    load();
  }, [load]);

  return {
    data,
    loading,
    error,
    reload: load,
  };
}
