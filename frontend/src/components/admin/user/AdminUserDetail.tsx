// frontend/src/components/admin/user/AdminUserDetail.tsx

import type { AdminUserDetail } from "@/types/admin-user";
import AdminUserStats from "./AdminUserStats";

type Props = {
  user: AdminUserDetail;
};

export default function AdminUserDetail({
  user,
}: Props) {
  return (
    <article className="space-y-4 rounded border p-4">
      <header className="flex items-center gap-3">
        {user.avatarUrl && (
          <img
            src={user.avatarUrl}
            alt=""
            className="h-12 w-12 rounded-full"
          />
        )}
        <div>
          <div className="text-sm font-medium">
            {user.displayName ?? user.username}
          </div>
          <div className="text-xs text-gray-500">
            @{user.username}
          </div>
        </div>
      </header>

      <section className="text-sm text-gray-700">
        <p>
          Role: <strong>{user.role}</strong>
        </p>
        <p>
          Status:{" "}
          {user.isDisabled ? (
            <span className="text-red-600">
              Disabled
            </span>
          ) : (
            <span className="text-green-600">
              Active
            </span>
          )}
        </p>
        <p>
          Joined:{" "}
          {new Date(
            user.createdAt,
          ).toLocaleDateString()}
        </p>
      </section>

      <AdminUserStats stats={user.stats} />
    </article>
  );
}
