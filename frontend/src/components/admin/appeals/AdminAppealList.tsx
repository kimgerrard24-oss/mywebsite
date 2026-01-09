// frontend/src/components/admin/appeals/AdminAppealList.tsx

import type { AdminAppealItem } from "@/types/admin-appeal";
import AdminAppealRow from "./AdminAppealRow";

type Props = {
  items: AdminAppealItem[];
};

export default function AdminAppealList({
  items,
}: Props) {
  if (items.length === 0) {
    return (
      <p className="text-sm text-gray-600">
        No appeals found.
      </p>
    );
  }

  return (
    <ul className="divide-y rounded-md border">
      {items.map((a) => (
        <AdminAppealRow
          key={a.id}
          item={a}
        />
      ))}
    </ul>
  );
}
