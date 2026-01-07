import type { AdminAction } from "@/types/admin-action";
import AdminActionItem from "./AdminActionItem";

type Props = {
  items: AdminAction[];
};

export default function AdminActionList({
  items,
}: Props) {
  if (items.length === 0) {
    return (
      <p className="p-4 text-sm text-gray-500">
        No admin actions found.
      </p>
    );
  }

  return (
    <ul className="divide-y">
      {items.map((action) => (
        /**
         * ==================================================
         * Read-only admin audit list
         *
         * - action: source of truth (from backend)
         * - frontend must NOT derive permission/state
         * ==================================================
         */
        <AdminActionItem
          key={action.id}
          action={action}
        />
      ))}
    </ul>
  );
}
