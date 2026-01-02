// frontend/src/components/admin/AdminDeleteCommentButton.tsx

import { useState } from 'react';
import { useAdminDeleteComment } from '@/hooks/useAdminDeleteComment';
import AdminDeleteCommentModal from './AdminDeleteCommentModal';

type Props = {
  commentId: string;
  onDeleted?: () => void;
};

export default function AdminDeleteCommentButton({
  commentId,
  onDeleted,
}: Props) {
  const [open, setOpen] = useState(false);
  const { deleteComment, loading } =
    useAdminDeleteComment();

  async function handleConfirm(reason?: string) {
    const ok = await deleteComment({
      commentId,
      reason,
    });

    if (ok) {
      setOpen(false);
      onDeleted?.();
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="text-sm text-red-600 hover:underline"
      >
        Delete
      </button>

      <AdminDeleteCommentModal
        open={open}
        loading={loading}
        onClose={() => setOpen(false)}
        onConfirm={handleConfirm}
      />
    </>
  );
}
