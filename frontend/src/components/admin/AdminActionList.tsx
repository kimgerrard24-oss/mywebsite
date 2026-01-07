// frontend/src/components/admin/AdminActionList.tsx

import type { AdminAction } from "@/types/admin-action";
import AdminActionDetail from "./AdminActionDetail"; // ← path ตามที่คุณใช้จริง

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
    <ul className="space-y-4 px-4 pb-6">
      {items.map((action) => (
        <li key={action.id}>
          <AdminActionDetail action={action} />
        </li>
      ))}
    </ul>
  );
}
