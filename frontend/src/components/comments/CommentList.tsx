// frontend/src/components/comments/CommentList.tsx

import { useEffect } from "react";
import CommentItem from "./CommentItem";
import { usePostComments } from "@/hooks/usePostComments";

type Props = {
  postId: string;
};

export default function CommentList({ postId }: Props) {
  const {
    items,
    loading,
    error,
    hasMore,
    loadInitialComments,
    loadMoreComments,
  } = usePostComments({ postId }); 

  useEffect(() => {
    loadInitialComments(); 
  }, [loadInitialComments]);

  return (
    <section className="mt-3" aria-label="Post comments list">
      {items.map((c) => (
        <CommentItem key={c.id} comment={c} />
      ))}

      {error && (
        <p className="mt-2 text-xs text-red-600">{error}</p>
      )}

      {hasMore && (
        <button
          type="button"
          onClick={loadMoreComments} 
          disabled={loading}
          className="mt-2 text-xs text-blue-600 hover:underline disabled:opacity-50"
        >
          {loading ? "Loading..." : "Load more comments"}
        </button>
      )}
    </section>
  );
}
