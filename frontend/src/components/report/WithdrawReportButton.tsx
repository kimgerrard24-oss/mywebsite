// frontend/src/components/report/WithdrawReportButton.tsx

import { useState } from "react";
import { useWithdrawReport } from "@/hooks/useWithdrawReport";

type Props = {
  reportId: string;
  onWithdrawed?: () => void;
};

export default function WithdrawReportButton({
  reportId,
  onWithdrawed,
}: Props) {
  const {
    execute,
    loading,
    error,
  } = useWithdrawReport();

  const [success, setSuccess] =
    useState(false);

  async function onClick() {
    if (loading || success) return;

    const ok = await execute(reportId);

    if (ok) {
      setSuccess(true);

      if (onWithdrawed) {
        onWithdrawed();
      } else {
        // backend authority → reload to sync state
        window.location.reload();
      }
    }
  }

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={onClick}
        disabled={loading || success}
        className="rounded-md border px-3 py-1 text-sm text-red-600 hover:bg-red-50 disabled:opacity-50"
      >
        Withdraw report
      </button>

      {loading && !success && (
        <p className="text-xs text-gray-500">
          Processing…
        </p>
      )}

      {error && !success && (
        <p className="text-xs text-red-600">
          {error}
        </p>
      )}

      {success && (
        <p className="text-xs text-green-700">
          Report withdrawn successfully.
        </p>
      )}
    </div>
  );
}

