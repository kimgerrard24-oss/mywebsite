import type { AdminAction } from '@/types/admin-action';
import AdminActionMeta from './AdminActionMeta';
import AdminAuditUnhidePanel from '@/components/admin/moderation/AdminAuditUnhidePanel';
import { isModerationTargetType } from '@/utils/isModerationTargetType';

type Props = {
  action: AdminAction;
};

export default function AdminActionDetail({
  action,
}: Props) {
  const moderationTargetType =
    isModerationTargetType(action.targetType)
      ? action.targetType
      : null;

  return (
    <section className="rounded border p-4">
      <AdminActionMeta action={action} />

      <div className="mt-4 space-y-2 text-sm">
        <div>
          <strong>Action:</strong>{' '}
          {action.actionType}
        </div>

        <div>
          <strong>Target:</strong>{' '}
          {action.targetType} (
          {action.targetId})
        </div>

        {action.reason && (
          <div>
            <strong>Reason:</strong>{' '}
            {action.reason}
          </div>
        )}

        {action.metadata && (
          <pre className="mt-2 rounded bg-gray-50 p-2 text-xs">
            {JSON.stringify(
              action.metadata,
              null,
              2,
            )}
          </pre>
        )}
      </div>

      {/* ===== Contextual UNHIDE (Detail context, backend authority) ===== */}
      {action.canUnhide === true &&
  moderationTargetType &&
  action.targetId && (
    <div className="mt-6">
      <AdminAuditUnhidePanel
        targetType={moderationTargetType}
        targetId={action.targetId}
      />
    </div>
  )}

    </section>
  );
}
