// frontend/src/components/admin/BanUserButton.tsx

import { useEffect, useState } from "react";
import { useBanUser } from "@/hooks/useBanUser";
import BanUserModal from "./BanUserModal";

type Props = {
  /**
   * 🎯 target user id
   */
  userId: string;

  /**
   * 🔒 current backend state
   * true = user is already banned
   */
  isDisabled: boolean;

  /**
   * 🛡 UI-level guard
   * (e.g. self-ban, protected admin)
   */
  disabled?: boolean;

  /**
   * 🔁 callback หลัง ban / unban สำเร็จ
   * ให้ parent refresh data
   */
  onChanged?: () => void;
};

export default function BanUserButton({
  userId,
  isDisabled,
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
  const [localDisabled, setLocalDisabled] =
    useState(isDisabled);

  /**
   * Sync local state with backend source of truth
   * (เมื่อ parent refresh users สำเร็จ)
   */
  useEffect(() => {
    setLocalDisabled(isDisabled);
  }, [isDisabled]);

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
      isDisabled: localDisabled,
      reason,
    });

    if (ok) {
      // optimistic update
      setLocalDisabled((prev) => !prev);

      setOpen(false);
      onChanged?.();
    }
  }

  /**
   * ==============================
   * Render
   * ==============================
   */

  const label = localDisabled ? "Unban" : "Ban";

  const buttonClass = localDisabled
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
        requireReason={!localDisabled}
        actionLabel={label}
        onConfirm={handleConfirm}
        onClose={() => setOpen(false)}
      />
    </>
  );
}
