// frontend/src/components/admin/AdminActionMeta.tsx

import type { AdminAction } from '@/types/admin-action';

type Props = {
  action: AdminAction;
};

export default function AdminActionMeta({
  action,
}: Props) {
  const actor = action.actor ?? action.admin;

  if (!actor) {
    return null;
  }

  return (
    <header className="mb-3 text-sm text-gray-600">
      <div>
        By{' '}
        <strong>
          {actor.displayName ??
            actor.username}
        </strong>

        {'role' in actor && (
          <> ({actor.role})</>
        )}
      </div>

      <time dateTime={action.createdAt}>
        {new Date(
          action.createdAt,
        ).toLocaleString()}
      </time>
    </header>
  );
}
