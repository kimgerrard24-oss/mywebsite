// frontend/src/components/admin/AdminUserList.tsx

import type { AdminUser } from "@/types/admin-user";
import AdminUserRow from "./AdminUserRow";

type Props = {
  /**
   * รายชื่อ users จาก backend
   * (GET /admin/users)
   */
  users: AdminUser[];

  /**
   * 🛡 current admin id
   * ใช้ป้องกัน admin แบนตัวเอง (ส่งต่อให้ row)
   */
  currentAdminId?: string;

  /**
   * 🔁 callback หลัง action สำเร็จ
   * เช่น ban / unban แล้ว reload data
   */
  onChanged?: () => void;
};

export default function AdminUserList({
  users,
  currentAdminId,
  onChanged,
}: Props) {
  return (
    <section
      aria-label="Admin user list"
      className="w-full"
    >
      <table className="w-full border-collapse text-sm">
        {/* ===== Table caption (a11y) ===== */}
        <caption className="sr-only">
          Administrative user list
        </caption>

        <thead>
          <tr className="border-b text-left text-gray-600">
            <th scope="col" className="px-3 py-2">
              Name
            </th>

            <th scope="col" className="px-3 py-2">
              Email
            </th>

            <th scope="col" className="px-3 py-2">
              Role
            </th>

            <th scope="col" className="px-3 py-2">
              Status
            </th>

            <th scope="col" className="px-3 py-2">
              Created
            </th>

            <th
              scope="col"
              className="px-3 py-2 text-right"
            >
              Actions
            </th>
          </tr>
        </thead>

        <tbody>
          {users.length === 0 ? (
            <tr>
              <td
                colSpan={6}
                className="px-3 py-8 text-center text-sm text-gray-500"
              >
                No users found
              </td>
            </tr>
          ) : (
            users.map((user) => (
              <AdminUserRow
                key={user.id}
                user={user}
                currentAdminId={currentAdminId}
                onChanged={onChanged}
              />
            ))
          )}
        </tbody>
      </table>
    </section>
  );
}
