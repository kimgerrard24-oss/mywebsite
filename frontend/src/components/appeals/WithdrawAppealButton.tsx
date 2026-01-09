// frontend/src/components/appeals/WithdrawAppealButton.tsx

import { useState } from "react";
import { useRouter } from "next/router";
import ConfirmDialog from "./ConfirmDialog";
import { withdrawAppeal } from "@/lib/api/appeals";

type Props = {
  appealId: string;
  disabled?: boolean;
};

export default function WithdrawAppealButton({
  appealId,
  disabled,
}: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleWithdraw() {
    try {
      setLoading(true);
      await withdrawAppeal(appealId);

      // reload detail → backend authority
      router.replace(router.asPath);
    } catch {
      // production-safe: silent
    } finally {
      setLoading(false);
      setOpen(false);
    }
  }

  return (
    <>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen(true)}
        className="
          text-sm
          text-red-600
          hover:underline
          disabled:text-gray-400
          disabled:no-underline
        "
      >
        Withdraw Appeal
      </button>

      <ConfirmDialog
        open={open}
        title="Withdraw this appeal?"
        description="This action cannot be undone."
        confirmText="Withdraw"
        onConfirm={handleWithdraw}
        onCancel={() => setOpen(false)}
        loading={loading}
      />
    </>
  );
}
