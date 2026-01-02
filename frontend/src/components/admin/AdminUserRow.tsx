// frontend/src/components/admin/AdminUserRow.tsx
import type { AdminUser } from "@/types/admin-user";

type Props = {
  user: AdminUser;
};

export default function AdminUserRow({ user }: Props) {
  return (
    <tr>
      <td className="px-3 py-2">
        {user.profile?.displayName ?? "—"}
      </td>

      <td className="px-3 py-2 text-gray-700">
        {user.email}
      </td>

      <td className="px-3 py-2">
        <span className="text-sm">
          {user.role}
        </span>
      </td>

      <td className="px-3 py-2">
        {user.isActive ? "Active" : "Disabled"}
      </td>

      <td className="px-3 py-2 text-sm text-gray-500">
        <time dateTime={user.createdAt}>
          {new Date(user.createdAt).toLocaleString()}
        </time>
      </td>
    </tr>
  );
}
