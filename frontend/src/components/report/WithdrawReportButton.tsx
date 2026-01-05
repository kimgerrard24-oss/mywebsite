// frontend/src/components/report/WithdrawReportButton.tsx

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

  async function onClick() {
    const ok = await execute(reportId);
    if (ok) {
      onWithdrawed?.();
    }
  }

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={onClick}
        disabled={loading}
        className="rounded-md border px-3 py-1 text-sm text-red-600 hover:bg-red-50 disabled:opacity-50"
      >
        Withdraw report
      </button>

      {error && (
        <p className="text-xs text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}
