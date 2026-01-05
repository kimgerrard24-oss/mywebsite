// frontend/src/hooks/useWithdrawReport.ts

import { useState } from "react";
import { withdrawReport } from "@/lib/api/reports-withdraw";

export function useWithdrawReport() {
  const [loading, setLoading] =
    useState(false);
  const [error, setError] =
    useState<string | null>(null);

  async function execute(
    reportId: string,
  ): Promise<boolean> {
    if (loading) return false;

    setLoading(true);
    setError(null);

    try {
      await withdrawReport(reportId);
      return true;
    } catch (err: any) {
      setError(
        err?.body?.message ??
          "Unable to withdraw report",
      );
      return false;
    } finally {
      setLoading(false);
    }
  }

  return {
    execute,
    loading,
    error,
  };
}
