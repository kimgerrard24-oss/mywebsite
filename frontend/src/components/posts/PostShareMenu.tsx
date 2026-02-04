// frontend/src/components/posts/PostShareMenu.tsx

import { useEffect, useRef, useState } from "react";
import RepostButton from "@/components/repost/RepostButton";
import ShareButton from "@/components/share/ShareButton";

type Props = {
  postId: string;
  originalPostId?: string;
  hasReposted: boolean;
  isBlocked: boolean;
  onOpenRepostComposer: (repostTargetId: string) => void;
};

export default function PostShareMenu({
  postId,
  originalPostId,
  hasReposted,
  isBlocked,
  onOpenRepostComposer,
}: Props) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);

  // Close on outside click
  useEffect(() => {
    if (!open) return;

    function handleClickOutside(e: MouseEvent) {
      if (!rootRef.current) return;
      if (!rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }

    function handleEscape(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  if (isBlocked) return null;

  return (
    <div ref={rootRef} className="relative inline-flex">
      {/* 🔁 ICON BUTTON */}
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Open share menu"
        onClick={() => setOpen((v) => !v)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setOpen((v) => !v);
          }
        }}
        className="
          inline-flex items-center justify-center
          rounded-md border border-gray-300
          px-2 py-1.5
          text-sm
          hover:bg-gray-100
          focus:outline-none
          focus:ring-2
          focus:ring-blue-500
          transition
        "
      >
        <span aria-hidden>🔁</span>
      </button>

      {/* 🔽 DROPDOWN */}
      {open && (
        <div
          role="menu"
          aria-label="Share options"
          className="
            absolute right-0 top-full z-20 mt-1
            min-w-[9rem]
            rounded-md border border-gray-200
            bg-white shadow-lg
            p-1
            animate-in fade-in slide-in-from-top-1
          "
        >
          {!hasReposted && (
            <div role="menuitem">
              <RepostButton
                postId={postId}
                originalPostId={originalPostId}
                onOpenComposer={({ repostOfPostId }) => {
                  onOpenRepostComposer(repostOfPostId);
                  setOpen(false);
                }}
              />
            </div>
          )}

          <div role="menuitem">
            <ShareButton postId={postId} />
          </div>
        </div>
      )}
    </div>
  );
}

