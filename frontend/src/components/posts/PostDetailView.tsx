// frontend/src/components/posts/PostDetailView.tsx

import { useEffect } from "react";
import type { PostDetail as PostDetailType } from "@/types/post-detail";
import PostDetail from "@/components/posts/PostDetail";
import { useState } from "react";
import CommentComposer from "@/components/comments/CommentComposer";
import CommentList from "@/components/comments/CommentList";

type Props = {
  post: PostDetailType;
  onClose: () => void;
};

export default function PostDetailView({
  post,
  onClose,
}: Props) {
  
  const [commentCount, setCommentCount] = useState<number>(0);
  const [commentListKey, setCommentListKey] = useState(0);

  /* =========================================
   * ESC Close
   * ========================================= */
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        onClose();
      }
    }

    window.addEventListener("keydown", handleKey);
    return () =>
      window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  return (
    <div
      className="
        fixed inset-0 z-50
        bg-black/80 backdrop-blur-sm
        flex items-start justify-center pt-16
        px-4
      "
      role="dialog"
      aria-modal="true"
    >
      {/* Close overlay click */}
      <div
        className="absolute inset-0"
        onClick={onClose}
      />

      {/* Floating Close Button (Outside Card) */}
<button
  onClick={onClose}
  aria-label="Close post viewer"
  className="
    fixed
    top-6
    right-6
    z-[60]
    h-10
    w-10
    flex
    items-center
    justify-center
    rounded-full
    bg-black/70
    text-white
    text-lg
    hover:bg-black
    transition
    focus:outline-none
    focus-visible:ring-2
    focus-visible:ring-white
  "
>
  ✕
</button>


      {/* Modal content */}
      <div
        className="
          relative
          z-10
          w-full
          max-w-3xl
          max-h-[90vh]
          overflow-y-auto
          rounded-xl
          bg-white
          shadow-2xl
          animate-fadeIn
        "
      >
       
        {/* Real Post */}
        <>
  <PostDetail
    post={post}
    embedded
  />

  <section className="mt-6 px-4 pb-6" aria-label="Post comments">
    <CommentComposer
      postId={post.id}
      onCreated={() => {
        setCommentCount((c) => c + 1);
        setCommentListKey((k) => k + 1);
      }}
    />

    <CommentList
      key={commentListKey}
      postId={post.id}
      onDeleted={() => {
        setCommentCount((c) => Math.max(0, c - 1));
      }}
    />
  </section>
</>

      </div>
    </div>
  );
}
