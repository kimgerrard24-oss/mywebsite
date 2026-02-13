// frontend/src/components/profile/ProfileMediaModal.tsx

import { useEffect, useState } from "react";
import type { ProfileMediaItem } from "@/types/profile-media-feed";
import type { PostDetail } from "@/types/post-detail";
import PostDetailView from "@/components/posts/PostDetailView";
import { api } from "@/lib/api/api";

type Props = {
  items: ProfileMediaItem[];
  index: number;
  loading?: boolean;
  onClose: () => void;
  onNavigate: (index: number) => void;
};

export function ProfileMediaModal({
  items,
  index,
  loading,
  onClose,
  onNavigate,
}: Props) {
  const media = items[index];

  const [post, setPost] = useState<PostDetail | null>(
    null,
  );
  const [postLoading, setPostLoading] =
    useState(false);
  const [postError, setPostError] =
    useState<string | null>(null);

  /* =========================================
   * Scroll Lock
   * ========================================= */
  useEffect(() => {
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = original;
    };
  }, []);

  /* =========================================
   * ESC + Arrow navigation
   * ========================================= */
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();

      if (
        e.key === "ArrowRight" &&
        index < items.length - 1
      ) {
        onNavigate(index + 1);
      }

      if (e.key === "ArrowLeft" && index > 0) {
        onNavigate(index - 1);
      }
    }

    window.addEventListener("keydown", handleKey);
    return () =>
      window.removeEventListener("keydown", handleKey);
  }, [index, items.length, onClose, onNavigate]);

  /* =========================================
   * Load Post Detail when media changes
   * ========================================= */
  useEffect(() => {
    if (!media?.postId) {
      setPost(null);
      return;
    }

    let active = true;

    async function loadPost() {
      try {
        setPostLoading(true);
        setPostError(null);

        const res = await api.get<PostDetail>(
          `/posts/${media.postId}`,
          { withCredentials: true },
        );

        if (!active) return;

        setPost(res.data);
      } catch {
        if (!active) return;
        setPostError(
          "ไม่สามารถโหลดโพสต์ได้",
        );
      } finally {
        if (active) setPostLoading(false);
      }
    }

    loadPost();

    return () => {
      active = false;
    };
  }, [media?.postId]);

  if (!media) return null;

  /* =========================================
   * Loading state (initial)
   * ========================================= */
  if (loading || postLoading) {
    return (
      <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center text-white">
        <div className="animate-pulse text-sm">
          กำลังโหลดโพสต์...
        </div>
      </div>
    );
  }

  /* =========================================
   * Error state
   * ========================================= */
  if (postError || !post) {
    return (
      <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center text-white">
        <div className="text-center space-y-3">
          <p>{postError ?? "ไม่พบโพสต์"}</p>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-white text-black rounded-md"
          >
            ปิด
          </button>
        </div>
      </div>
    );
  }

  /* =========================================
   * Render Real Post
   * ========================================= */
  return (
    <PostDetailView
      post={post}
      onClose={onClose}
    />
  );
}

