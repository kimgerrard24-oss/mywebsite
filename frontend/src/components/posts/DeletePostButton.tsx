// frontend/src/components/posts/DeletePostButton.tsx

import { useDeletePost } from '@/hooks/useDeletePost';

export type DeletePostButtonVariant = 'default' | 'menu';

type Props = {
  postId: string;

  /**
   * permission
   * true = owner (or allowed)
   */
  canDelete: boolean;

  // legacy
  onDeleted?: () => void;

  // menu support
  variant?: DeletePostButtonVariant;
  onDone?: () => void;
};

export default function DeletePostButton({
  postId,
  canDelete,
  onDeleted,
  variant = 'default',
  onDone,
}: Props) {
  const { remove, loading, error } = useDeletePost();

  // 🔒 owner only
  if (!canDelete) {
    return null;
  }

  async function handleDelete() {
    const ok = window.confirm('Delete this post?');
    if (!ok) return;

    const success = await remove(postId);
    if (!success) return;

    onDeleted?.();
    onDone?.();
  }

  // ===== default =====
  if (variant === 'default') {
    return (
      <div className="inline-flex flex-col items-start">
        <button
          type="button"
          onClick={handleDelete}
          disabled={loading}
          className="text-sm text-red-600 hover:underline disabled:opacity-50"
        >
          {loading ? 'Deleting…' : 'Delete'}
        </button>

        {error && (
          <span className="mt-1 text-xs text-red-500">
            {error}
          </span>
        )}
      </div>
    );
  }

  // ===== dropdown menu =====
 return (
  <button
    type="button"
    onClick={handleDelete}
    disabled={loading}
    role="menuitem"
    aria-disabled={loading}
    className="
      w-full
      text-left
      px-3
      sm:px-4
      py-2
      text-xs
      sm:text-sm
      text-red-600
      hover:bg-gray-100
      focus:outline-none
      focus:bg-gray-100
      disabled:opacity-50
      disabled:cursor-not-allowed
      transition
    "
  >
    {loading ? "Deleting…" : "Delete"}
  </button>
);

}
