// frontend/src/components/admin/AdminActionItem.tsx

import type { AdminAction } from '@/types/admin-action';

type Props = {
  action: AdminAction;
};

export default function AdminActionItem({ action }: Props) {
  const actor = action.actor ?? action.admin;

  return (
    <li className="border-b px-4 py-3 text-sm">
      <div className="flex justify-between">
        <span className="font-medium">
          {action.actionType} {action.targetType}
        </span>

        <time
          dateTime={action.createdAt}
          className="text-xs text-gray-500"
        >
          {new Date(action.createdAt).toLocaleString()}
        </time>
      </div>

      <div className="mt-1 text-gray-700">
        Target ID: {action.targetId}
      </div>

      {action.reason && (
        <div className="mt-1 text-gray-600">
          Reason: {action.reason}
        </div>
      )}

      {actor && (
        <div className="mt-1 text-xs text-gray-500">
          By:{' '}
          {actor.displayName ??
            actor.username}
        </div>
      )}
    </li>
  );
}
