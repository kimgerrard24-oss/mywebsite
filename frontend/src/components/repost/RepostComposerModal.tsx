// frontend/src/components/repost/RepostComposerModal.tsx

"use client";

import { useCallback } from "react";
import Avatar from "@/components/ui/Avatar";
import PostMediaGrid from "@/components/posts/PostMediaGrid";
import PostComposer from "@/components/posts/PostComposer";
import type { PostFeedItem } from "@/types/post-feed";
import type { PostDetail } from "@/types/post-detail";

type RepostSource = PostFeedItem | PostDetail;

type Props = {
  repostOfPost: RepostSource;
  repostTargetId: string;
  onClose: () => void;
  onPosted: () => void;
};

export default function RepostComposerModal({
  repostOfPost,
  repostTargetId,
  onClose,
  onPosted,
}: Props) {
  const author = repostOfPost.author;
  const originalMedia = repostOfPost.originalPost
    ? repostOfPost.originalPost.media
    : repostOfPost.media;

  const originalContent = repostOfPost.originalPost
    ? repostOfPost.originalPost.content
    : repostOfPost.content;

  const handlePosted = useCallback(() => {
    onPosted();
  }, [onPosted]);

  return (
    <div
      className="
        fixed inset-0 z-50
        flex items-center justify-center
        bg-black/40
        backdrop-blur-sm
      "
      role="dialog"
      aria-modal="true"
    >
      <div
        className="
          w-full max-w-xl
          mx-3
          rounded-xl
          bg-white
          shadow-xl
          overflow-hidden
        "
      >
        {/* ================= Header ================= */}
        <header
          className="
            flex items-center justify-between
            px-4 py-3
            border-b
          "
        >
          <h2 className="text-sm font-medium text-gray-900">
            แชร์โพสต์
          </h2>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close repost composer"
            className="
              text-gray-500
              hover:text-gray-700
              text-lg
            "
          >
            ×
          </button>
        </header>

        {/* ================= Composer ================= */}
        <div className="px-4 pt-3">
          <PostComposer
            repostOfPostId={repostTargetId}
            disableMedia
            onPosted={handlePosted}
            onPostCreated={handlePosted}
          />
        </div>

        {/* ================= Original Post Preview ================= */}
        <section
          className="
            mx-4 my-3
            rounded-lg
            border
            border-gray-200
            bg-gray-50
            p-3
          "
          aria-label="Original post preview"
        >
          {/* Author */}
          <div className="flex items-start gap-2 mb-2">
            <Avatar
              avatarUrl={author.avatarUrl}
              name={author.displayName}
              size={32}
            />

            <div className="min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {author.displayName}
              </p>
              <p className="text-xs text-gray-500">
                โพสต์ต้นฉบับ
              </p>
            </div>
          </div>

          {/* Content */}
          {originalContent && (
            <p
              className="
                text-sm
                text-gray-800
                whitespace-pre-wrap
                break-words
                mb-2
              "
            >
              {originalContent}
            </p>
          )}

          {/* Media */}
          {originalMedia && originalMedia.length > 0 && (
            <PostMediaGrid media={originalMedia} />
          )}
        </section>
      </div>
    </div>
  );
}
