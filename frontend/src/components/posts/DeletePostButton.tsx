// frontend/src/components/posts/DeletePostButton.tsx
import { useDeletePost } from '@/hooks/useDeletePost';


 type Props = {
  postId: string;
  onDeleted?: () => void;
 };


 export default function DeletePostButton({ postId, onDeleted }: Props) {
  const { remove, loading, error } = useDeletePost();


  async function handleDelete() {
   const ok = window.confirm('Delete this post?');
  if (!ok) return;

   const success = await remove(postId);
  if (success) {
    onDeleted?.();
    }
  }

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
   <span className="mt-1 text-xs text-red-500">{error}</span>
  )}
    </div>
  );
}