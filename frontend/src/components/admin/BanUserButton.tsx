// frontend/src/components/admin/BanUserButton.tsx

import { useEffect, useState } from "react";
import { useBanUser } from "@/hooks/useBanUser";
import BanUserModal from "./BanUserModal";

type Props = {
  /**
   * target user id
   */
  userId: string;

  /**
   * backend authority
   * true = user is banned
   */
  isBanned: boolean;

  /**
   * UI-level guard
   * (e.g. self-ban, protected admin)
   */
  disabled?: boolean;

  /**
   * callback หลัง ban / unban สำเร็จ
   * ให้ parent refresh data
   */
  onChanged?: () => void;
};

export default function BanUserButton({
  userId,
  isBanned,
  disabled = false,
  onChanged,
}: Props) {
  const [open, setOpen] = useState(false);

  /**
   * ==============================
   * Optimistic UI state
   * ==============================
   *
   * - ใช้เพื่อเปลี่ยน label / action ทันทีหลัง ban/unban
   * - backend ยังคงเป็น authority
   * - เมื่อ parent refetch เสร็จ ค่า prop จะ sync กลับมา
   */
  const [localBanned, setLocalBanned] =
    useState(isBanned);

  /**
   * Sync local state with backend source of truth
   * (เมื่อ parent refresh users สำเร็จ)
   */
  useEffect(() => {
    setLocalBanned(isBanned);
  }, [isBanned]);

  const {
    execute,
    loading,
    error,
  } = useBanUser();

  /**
   * ==============================
   * Handlers
   * ==============================
   */
  async function handleConfirm(reason: string) {
    const ok = await execute({
      userId,
      banned: !localBanned,
      reason,
    });

    if (ok) {
      // optimistic update
      setLocalBanned((prev) => !prev);

      setOpen(false);
      onChanged?.();
    }
  }

  /**
   * ==============================
   * Render
   * ==============================
   */

  const label = localBanned ? "Unban" : "Ban";

  const buttonClass = localBanned
    ? "text-sm text-green-600 hover:underline"
    : "text-sm text-red-600 hover:underline";

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        disabled={disabled || loading}
        aria-disabled={disabled || loading}
        className={buttonClass}
      >
        {label}
      </button>

      <BanUserModal
        open={open}
        loading={loading}
        error={error}
        requireReason={!localBanned}
        actionLabel={label}
        onConfirm={handleConfirm}
        onClose={() => setOpen(false)}
      />
    </>
  );
}
