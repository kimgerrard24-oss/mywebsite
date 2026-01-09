// frontend/src/components/admin/appeals/AdminAppealDetailView.tsx

import type { AdminAppealDetail } from '@/types/admin-appeal';
import AdminAppealTargetPreview from './AdminAppealTargetPreview';

type Props = {
  appeal: AdminAppealDetail;
};

export default function AdminAppealDetailView({
  appeal,
}: Props) {
  return (
    <section className="space-y-4 rounded-md border p-4">
      <header className="flex justify-between gap-4">
        <div>
          <p className="text-sm font-medium">
            Target: {appeal.targetType}
          </p>
          <p className="text-xs text-gray-500">
            ID: {appeal.targetId}
          </p>
        </div>

        <span className="rounded bg-gray-100 px-2 py-1 text-xs">
          {appeal.status}
        </span>
      </header>

      <AdminAppealTargetPreview appeal={appeal} />

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

      {appeal.moderationAction && (
        <div className="rounded bg-gray-50 p-3 text-sm">
          <p className="font-medium">
            Moderation Action
          </p>
          <p>
            {appeal.moderationAction.actionType}
          </p>
          <p className="text-xs text-gray-500">
            {new Date(
              appeal.moderationAction.createdAt,
            ).toLocaleString()}
          </p>
        </div>
      )}

      {appeal.resolutionNote && (
        <div className="rounded bg-gray-50 p-3 text-sm">
          <p className="font-medium">Admin Note</p>
          <p className="whitespace-pre-wrap">
            {appeal.resolutionNote}
          </p>
        </div>
      )}

      <footer className="text-xs text-gray-500">
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
      </footer>
    </section>
  );
}
