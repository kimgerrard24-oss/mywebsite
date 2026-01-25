// frontend/src/components/posts/PostLikeListModal.tsx

// frontend/src/components/posts/PostLikeListModal.tsx

import { useEffect } from "react";
import PostLikeList from "@/components/posts/PostLikeList";
import type { PostLike } from "@/types/post-like";

type Props = {
  open: boolean;
  onClose: () => void;

  likes: PostLike[];
  loading: boolean;
  error: string | null;
  hasMore: boolean;
  onLoadMore: () => void;
};

export default function PostLikeListModal({
  open,
  onClose,
  likes,
  loading,
  error,
  hasMore,
  onLoadMore,
}: Props) {
  // =========================
  // 🔒 Lock body scroll when open
  // =========================
  useEffect(() => {
    if (!open) return;

    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = original;
    };
  }, [open]);

  // =========================
  // ⌨️ ESC to close
  // =========================
  useEffect(() => {
    if (!open) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="People who liked this post"
      className="
        fixed inset-0 z-50
        flex items-center justify-center
        bg-black/40
        backdrop-blur-sm
      "
      onClick={onClose}
    >
      {/* ===== Modal Card ===== */}
      <div
        className="
          w-full max-w-sm
          sm:max-w-md
          mx-4
          bg-white
          rounded-xl
          shadow-xl
          max-h-[80vh]
          flex flex-col
        "
        onClick={(e) => e.stopPropagation()}
      >
        {/* ===== Header ===== */}
        <header
          className="
            flex items-center justify-between
            px-4 py-3
            border-b
          "
        >
          <h2 className="text-sm font-semibold">
            Likes
          </h2>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close likes"
            className="
              text-gray-500 hover:text-gray-800
              text-lg leading-none
            "
          >
            ×
          </button>
        </header>

        {/* ===== Content (scroll area) ===== */}
        <div
          className="
            flex-1 overflow-y-auto
            px-4 py-3
          "
        >
          <PostLikeList
            likes={likes}
            loading={loading}
            error={error}
            hasMore={hasMore}
            onLoadMore={onLoadMore}
          />
        </div>

        {/* ===== Footer (optional UX) ===== */}
        <footer
          className="
            border-t
            px-4 py-2
            text-center
            text-xs text-gray-500
          "
        >
          Tap outside or press ESC to close
        </footer>
      </div>
    </div>
  );
}

