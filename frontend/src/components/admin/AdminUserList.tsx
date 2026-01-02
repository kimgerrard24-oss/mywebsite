import type { AdminUser } from "@/types/admin-user";
import AdminUserRow from "./AdminUserRow";

type Props = {
  users: AdminUser[];
};

export default function AdminUserList({ users }: Props) {
  return (
    <section aria-label="Admin user list">
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b text-left text-sm text-gray-600">
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
          </tr>
        </thead>

        <tbody>
          {users.length === 0 ? (
            <tr>
              <td
                colSpan={5}
                className="px-3 py-6 text-center text-sm text-gray-500"
              >
                No users found
              </td>
            </tr>
          ) : (
            users.map((u) => (
              <AdminUserRow key={u.id} user={u} />
            ))
          )}
        </tbody>
      </table>
    </section>
  );
}
