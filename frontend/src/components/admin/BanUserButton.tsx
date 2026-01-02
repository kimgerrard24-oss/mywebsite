// frontend/src/components/admin/BanUserButton.tsx

import { useState } from "react";
import { useBanUser } from "@/hooks/useBanUser";
import BanUserModal from "./BanUserModal";

type Props = {
  userId: string;
  onBanned?: () => void;
};

export default function BanUserButton({
  userId,
  onBanned,
}: Props) {
  const [open, setOpen] = useState(false);
  const { banUser, loading, error } =
    useBanUser();

  async function handleConfirm(
    reason: string,
  ) {
    const ok = await banUser(userId, reason);
    if (ok) {
      setOpen(false);
      onBanned?.();
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="text-sm text-red-600 hover:underline"
      >
        Ban
      </button>

      <BanUserModal
        open={open}
        loading={loading}
        error={error}
        onConfirm={handleConfirm}
        onClose={() => setOpen(false)}
      />
    </>
  );
}
