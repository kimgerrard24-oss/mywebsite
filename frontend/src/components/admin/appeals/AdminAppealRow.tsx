// frontend/src/components/admin/appeals/AdminAppealRow.tsx

import Link from "next/link";
import type { AdminAppealItem } from "@/types/admin-appeal";
import AdminAppealStatusBadge from "./AdminAppealStatusBadge";

type Props = {
  item: AdminAppealItem;
};

export default function AdminAppealRow({
  item,
}: Props) {
  return (
    <li className="p-4">
      <div className="flex justify-between gap-4">
        <div className="space-y-1">
          <p className="text-sm font-medium">
            {item.targetType}
          </p>

          <p className="text-xs text-gray-500">
            Reason: {item.reason}
          </p>

          <p className="text-xs text-gray-400">
            {new Date(
              item.createdAt,
            ).toLocaleString()}
          </p>
        </div>

        <div className="flex flex-col items-end gap-2">
          <AdminAppealStatusBadge
            status={item.status}
          />

          <Link
            href={`/admin/appeals/appeals/${item.id}`}
            className="text-xs text-blue-600 hover:underline"
          >
            View
          </Link>
        </div>
      </div>
    </li>
  );
}
