// frontend/src/hooks/useCreateReport.ts

import { useState } from "react";
import {
  createReport,
  CreateReportPayload,
} from "@/lib/api/reports";

export function useCreateReport() {
  const [loading, setLoading] =
    useState(false);
  const [error, setError] =
    useState<string | null>(null);

  async function execute(
    payload: CreateReportPayload,
  ): Promise<boolean> {
    setLoading(true);
    setError(null);

    try {
      await createReport(payload);
      return true;
    } catch (err: any) {
      /**
       * Backend is authority
       * - 409 = duplicate report
       * - other = generic failure
       */
      if (err?.status === 409) {
        setError(
          err?.body?.message ??
            "You have already reported this content",
        );
      } else {
        setError(
          err?.body?.message ??
            "Failed to submit report",
        );
      }

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
