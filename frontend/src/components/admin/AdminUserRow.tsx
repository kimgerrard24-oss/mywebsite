// frontend/src/components/admin/AdminUserRow.tsx

import type { AdminUser } from "@/types/admin-user";
import BanUserButton from "./BanUserButton";

type Props = {
  /**
   * user data จาก backend
   * (GET /admin/users)
   */
  user: AdminUser;

  /**
   * 🔁 callback หลัง ban / unban สำเร็จ
   * ให้ parent refresh data
   */
  onChanged?: () => void;

  /**
   * 🛡 current admin id
   * ใช้ป้องกัน admin แบนตัวเอง (UX guard)
   */
  currentAdminId?: string;
};

export default function AdminUserRow({
  user,
  onChanged,
  currentAdminId,
}: Props) {
  /**
   * ==============================
   * 🔒 Source of truth (backend)
   * ==============================
   */
  const isDisabled = !user.isActive;


  const statusLabel = isDisabled ? "Disabled" : "Active";

  const statusClass = isDisabled
    ? "text-red-600"
    : "text-green-600";

  /**
   * ==============================
   * 🔐 UI-level safety rules
   * (backend must enforce again)
   * ==============================
   */

  // ❌ admin ห้ามแบนตัวเอง (UX guard)
  const isSelf =
    currentAdminId != null &&
    user.id === currentAdminId;

  // ❌ protected admin (UI-only rule)
  // backend ต้อง enforce ซ้ำ
  const isProtectedAdmin =
    user.role === "ADMIN";

  const canBan =
    !isSelf && !isProtectedAdmin;

  /**
   * ==============================
   * Render
   * ==============================
   */
  return (
    <tr
      className="border-b last:border-b-0"
      aria-label={`Admin user row ${user.email}`}
    >
      {/* ===== Display Name ===== */}
      <td className="px-3 py-2">
        {user.profile?.displayName ?? "—"}
      </td>

      {/* ===== Email ===== */}
      <td className="px-3 py-2 text-gray-700">
        {user.email}
      </td>

      {/* ===== Role ===== */}
      <td className="px-3 py-2">
        <span className="text-sm font-medium">
          {user.role}
        </span>
      </td>

      {/* ===== Status ===== */}
      <td className="px-3 py-2">
        <span
          className={`text-sm font-medium ${statusClass}`}
        >
          {statusLabel}
        </span>
      </td>

      {/* ===== Created At ===== */}
      <td className="px-3 py-2 text-sm text-gray-500">
        <time
          dateTime={user.createdAt}
          suppressHydrationWarning
        >
          {new Date(
            user.createdAt,
          ).toLocaleString()}
        </time>
      </td>

      {/* ===== Actions ===== */}
      <td className="px-3 py-2 text-right">
        <BanUserButton
          userId={user.id}
          isDisabled={isDisabled}
          disabled={!canBan}
          onChanged={onChanged}
        />
      </td>
    </tr>
  );
}
