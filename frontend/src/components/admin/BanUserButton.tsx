// frontend/src/components/admin/BanUserButton.tsx

import { useState } from "react";
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
      isDisabled,
      reason,
    });

    if (ok) {
      setOpen(false);
      onChanged?.();
    }
  }

  /**
   * ==============================
   * Render
   * ==============================
   */

  const label = isDisabled ? "Unban" : "Ban";

  const buttonClass = isDisabled
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
        requireReason={!isDisabled}
        actionLabel={label}
        onConfirm={handleConfirm}
        onClose={() => setOpen(false)}
      />
    </>
  );
}
