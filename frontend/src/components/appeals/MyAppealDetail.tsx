// frontend/src/components/appeals/MyAppealDetail.tsx

import type { MyAppealDetail } from '@/types/appeal';
import AppealStatusBadge from './AppealStatusBadge';
import WithdrawAppealButton from './WithdrawAppealButton';

type Props = {
  appeal: MyAppealDetail;
};

export default function MyAppealDetail({
  appeal,
}: Props) {
  /**
   * UX guard only — backend is authority
   */
  const canWithdraw =
    appeal.status === 'PENDING';

  return (
    <section className="space-y-4 rounded-md border p-4">
      {/* ===== Header ===== */}
      <header className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-sm font-medium">
            Target: {appeal.targetType}
          </h2>
          <p className="text-xs text-gray-500">
            ID: {appeal.targetId}
          </p>
        </div>

        <AppealStatusBadge status={appeal.status} />
      </header>

      {/* ===== Content ===== */}
      <div className="space-y-2 text-sm">
        <div>
          <p className="font-medium">Reason</p>
          <p className="text-gray-700">
            {appeal.reason}
          </p>
        </div>

        {appeal.detail && (
          <div>
            <p className="font-medium">Detail</p>
            <p className="whitespace-pre-wrap text-gray-700">
              {appeal.detail}
            </p>
          </div>
        )}
      </div>

      {/* ===== Footer ===== */}
      <footer className="space-y-2 border-t pt-3 text-xs text-gray-500">
        <p>
          Submitted:{' '}
          {new Date(
            appeal.createdAt,
          ).toLocaleString()}
        </p>

        {appeal.resolvedAt && (
          <p>
            Resolved:{' '}
            {new Date(
              appeal.resolvedAt,
            ).toLocaleString()}
          </p>
        )}

        {appeal.resolutionNote && (
          <div>
            <p className="font-medium text-gray-700">
              Admin note
            </p>
            <p className="whitespace-pre-wrap text-gray-600">
              {appeal.resolutionNote}
            </p>
          </div>
        )}

        {/* ===== Withdraw Action (NEW) ===== */}
        {canWithdraw && (
          <div className="pt-2">
            <WithdrawAppealButton
              appealId={appeal.id}
            />
          </div>
        )}
      </footer>
    </section>
  );
}
