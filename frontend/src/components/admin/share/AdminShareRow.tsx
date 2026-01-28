// frontend/src/components/admin/share/AdminShareRow.tsx

import Link from "next/link";
import type {
  AdminShareDetail,
} from "@/types/admin-share";

type Props = {
  share: AdminShareDetail;
};

export default function AdminShareRow({
  share,
}: Props) {
  return (
    <tr className="border-b text-sm">
      <td className="p-2">{share.id}</td>
      <td className="p-2">
        {share.isDisabled ? (
          <span className="text-red-600">
            Disabled
          </span>
        ) : (
          <span className="text-green-600">
            Active
          </span>
        )}
      </td>
      <td className="p-2">
        <Link
          href={`/admin/shares/${share.id}`}
          className="text-blue-600 hover:underline"
        >
          View
        </Link>
      </td>
    </tr>
  );
}
