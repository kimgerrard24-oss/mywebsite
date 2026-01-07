// frontend/src/components/admin/AdminActionItem.tsx

import type { AdminAction } from "@/types/admin-action";
import AdminModerationPanel from "@/components/admin/moderation/AdminModerationPanel";
import { isModerationTargetType } from "@/utils/isModerationTargetType";

type Props = {
  action: AdminAction;
  canUnhide?: boolean;
};

export default function AdminActionItem({
  action,
  canUnhide = false,
}: Props) {
  const actor = action.actor ?? action.admin;

  const moderationTargetType =
    isModerationTargetType(action.targetType)
      ? action.targetType
      : null;

  return (
    <li className="border-b px-4 py-3 text-sm">
      {/* ===== Header ===== */}
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

      {/* ===== Target ===== */}
      <div className="mt-1 text-gray-700">
        Target ID: {action.targetId}
      </div>

      {/* ===== Reason ===== */}
      {action.reason && (
        <div className="mt-1 text-gray-600">
          Reason: {action.reason}
        </div>
      )}

      {/* ===== Actor ===== */}
      {actor && (
        <div className="mt-1 text-xs text-gray-500">
          By {actor.displayName ?? actor.username}
        </div>
      )}

      {/* ===== Contextual UNHIDE (Audit context only) ===== */}
      {canUnhide && moderationTargetType && (
        <AdminModerationPanel
          targetType={moderationTargetType}
          targetId={action.targetId}
        />
      )}
    </li>
  );
}
