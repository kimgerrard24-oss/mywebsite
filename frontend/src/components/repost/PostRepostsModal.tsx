// frontend/src/components/reposts/PostRepostsModal.tsx

import { useEffect, useRef } from "react";
import PostRepostsList from "./PostRepostsList";

type Props = {
  postId: string;
  open: boolean;
  onClose: () => void;
};

export default function PostRepostsModal({
  postId,
  open,
  onClose,
}: Props) {
  const dialogRef = useRef<HTMLDivElement | null>(null);

  /**
   * =================================================
   * ⌨️ Accessibility: ESC to close
   * =================================================
   */
  useEffect(() => {
    if (!open) return;

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        onClose();
      }
    }

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onClose]);

  /**
   * =================================================
   * 🔒 Prevent background scroll (mobile UX)
   * =================================================
   */
  useEffect(() => {
    if (!open) return;

    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = original;
    };
  }, [open]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="repost-modal-title"
      className="
        fixed
        inset-0
        z-50
        flex
        items-center
        justify-center
      "
    >
      {/* ================= Overlay ================= */}
      <div
        className="
          absolute
          inset-0
          bg-black/40
          backdrop-blur-[1px]
        "
        onClick={onClose}
        aria-hidden="true"
      />

      {/* ================= Modal ================= */}
      <div
        ref={dialogRef}
        className="
          relative
          z-10
          flex
          max-h-[85vh]
          w-full
          max-w-md
          flex-col
          overflow-hidden
          rounded-lg
          bg-white
          shadow-xl

          sm:max-h-[80vh]
        "
      >
        {/* ===== Header ===== */}
        <header
          className="
            flex
            items-center
            justify-between
            border-b
            px-4
            py-3
          "
        >
          <h2
            id="repost-modal-title"
            className="
              text-sm
              sm:text-base
              font-medium
              text-gray-900
            "
          >
            การ Repost
          </h2>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close repost list"
            className="
              inline-flex
              h-8
              w-8
              items-center
              justify-center
              rounded-full
              text-gray-500
              hover:bg-gray-100
              focus:outline-none
              focus-visible:ring-2
              focus-visible:ring-blue-500
            "
          >
            ✕
          </button>
        </header>

        {/* ===== Body ===== */}
        <div
          className="
            flex-1
            overflow-y-auto
          "
        >
          <PostRepostsList postId={postId} />
        </div>

        {/* ===== Footer (mobile UX hint) ===== */}
        <footer
          className="
            border-t
            px-4
            py-2
            text-center
            text-xs
            text-gray-500
          "
        >
          คลิกภายนอกหรือกด ESC เพื่อปิด
        </footer>
      </div>
    </div>
  );
}
