// frontend/src/components/admin/DeletePostButton.tsx

import { useState } from "react";
import { useAdminDeletePost } from "@/hooks/useAdminDeletePost";
import DeletePostConfirmModal from "./DeletePostConfirmModal";

type Props = {
  postId: string;
  onDeleted?: () => void;
};

export default function DeletePostButton({
  postId,
  onDeleted,
}: Props) {
  const [open, setOpen] = useState(false);
  const { deletePost, loading, error } =
    useAdminDeletePost();

  async function handleConfirm(
    reason: string,
  ) {
    const ok = await deletePost(postId, reason);
    if (ok) {
      setOpen(false);
      onDeleted?.();
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="text-sm text-red-600 hover:underline"
      >
        Delete
      </button>

      <DeletePostConfirmModal
        open={open}
        loading={loading}
        error={error}
        onConfirm={handleConfirm}
        onClose={() => setOpen(false)}
      />
    </>
  );
}
