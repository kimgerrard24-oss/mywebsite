// frontend/src/components/admin/appeals/AdminAppealTargetPreview.tsx

import type { AdminAppealDetail } from '@/types/admin-appeal';

type Props = {
  appeal: AdminAppealDetail;
};

export default function AdminAppealTargetPreview({
  appeal,
}: Props) {
  return (
    <div className="rounded border bg-gray-50 p-3 text-xs">
      <p className="font-medium">
        Target Preview (ID only)
      </p>
      <p>Type: {appeal.targetType}</p>
      <p>ID: {appeal.targetId}</p>

      {/* intentionally not loading target entity here
          to avoid leaking deleted / hidden content */}
    </div>
  );
}
