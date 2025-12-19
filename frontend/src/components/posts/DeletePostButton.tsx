// frontend/src/components/posts/DeletePostButton.tsx
import { useDeletePost } from '@/hooks/useDeletePost';

export type DeletePostButtonVariant = 'default' | 'menu';

type Props = {
  postId: string;

  // legacy
  onDeleted?: () => void;

  // menu support
  variant?: DeletePostButtonVariant;
  onDone?: () => void;
};

export default function DeletePostButton({
  postId,
  onDeleted,
  variant = 'default',
  onDone,
}: Props) {
  const { remove, loading, error } = useDeletePost();

  async function handleDelete() {
    const ok = window.confirm('Delete this post?');
    if (!ok) return;

    const success = await remove(postId);
    if (success) {
      onDeleted?.();
      onDone?.();
    }
  }

  // ===== default (NOT used anymore in PostDetail) =====
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
      className="w-full text-left text-sm text-red-600 hover:bg-gray-100 disabled:opacity-50"
      role="menuitem"
    >
      {loading ? 'Deleting…' : 'Delete'}
    </button>
  );
}
