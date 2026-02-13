// frontend/src/components/posts/PostDetailView.tsx

import { useEffect } from "react";
import type { PostDetail as PostDetailType } from "@/types/post-detail";
import PostDetail from "@/components/posts/PostDetail";

type Props = {
  post: PostDetailType;
  onClose: () => void;
};

export default function PostDetailView({
  post,
  onClose,
}: Props) {
  /* =========================================
   * Body Scroll Lock
   * ========================================= */
  useEffect(() => {
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = original;
    };
  }, []);

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
        flex items-center justify-center
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
        {/* Close button */}
        <button
          onClick={onClose}
          className="
            absolute
            top-3
            right-3
            text-gray-500
            hover:text-black
            text-xl
            z-20
          "
          aria-label="Close post viewer"
        >
          ✕
        </button>

        {/* Real Post */}
        <PostDetail
          post={post}
          embedded
        />
      </div>
    </div>
  );
}
