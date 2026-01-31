// frontend/src/components/posts/PostPublicDetail.tsx

import Link from "next/link";
import { renderContentWithHashtags } from "@/utils/renderContentWithHashtags";
import PostMediaViewer from "@/components/media/PostMediaViewer";
import Avatar from "@/components/ui/Avatar";
import type { PublicPostDetail } from "@/types/public-post-detail";

type Props = {
  post: PublicPostDetail;
};

export default function PostPublicDetail({ post }: Props) {
  return (
    <>
      {/* ================= Header ================= */}
      <header
        className="
          mb-3
          sm:mb-4
          flex
          items-start
          sm:items-center
          justify-between
          gap-2
          sm:gap-3
        "
      >
        {/* ===== Author ===== */}
        <Link
          href={`/users/${post.author.id}`}
          className="
            flex
            items-center
            gap-2
            sm:gap-3
            hover:underline
            min-w-0
          "
        >
          <Avatar
            avatarUrl={post.author.avatarUrl}
            name={post.author.displayName}
            size={40}
          />

          <span
            className="
              font-medium
              text-sm
              sm:text-base
              truncate
            "
          >
            {post.author.displayName}
          </span>
        </Link>

        {/* ===== Timestamp ===== */}
        <time
          dateTime={post.createdAt}
          className="
            text-xs
            sm:text-sm
            text-gray-500
            whitespace-nowrap
            flex-shrink-0
          "
        >
          {new Date(post.createdAt).toLocaleString()}
        </time>
      </header>

      {/* ================= Content ================= */}
      <section
        className="
          prose
          prose-sm
          sm:prose-base
          max-w-none
          break-words
        "
        aria-label="Post content"
      >
        <p>{renderContentWithHashtags(post.content)}</p>
      </section>

      {/* ================= Media ================= */}
      {Array.isArray(post.media) && post.media.length > 0 && (
        <section
          className="
            mt-3
            sm:mt-4
            space-y-3
            sm:space-y-4
          "
          aria-label="Post media"
        >
          {post.media.map((m) => {
            const src = m.cdnUrl ?? m.url;

            if (m.type === "image") {
              return (
                <figure
                  key={m.id}
                  className="
                    overflow-hidden
                    rounded-lg
                    sm:rounded-xl
                  "
                >
                  <img
                    src={src}
                    alt=""
                    loading="lazy"
                    className="
                      w-full
                      max-h-[60vh]
                      sm:max-h-[70vh]
                      object-contain
                      bg-black/5
                    "
                  />
                </figure>
              );
            }

            if (m.type === "video") {
              return (
                <figure
                  key={m.id}
                  className="
                    overflow-hidden
                    rounded-lg
                    sm:rounded-xl
                    bg-black
                  "
                >
                  <video
                    src={src}
                    controls
                    preload="metadata"
                    className="
                      w-full
                      max-h-[60vh]
                      sm:max-h-[70vh]
                      object-contain
                    "
                  />
                </figure>
              );
            }

            return null;
          })}
        </section>
      )}

      {/* ================= Public Notice ================= */}
      <footer
        className="
          mt-4
          sm:mt-5
          text-xs
          sm:text-sm
          text-gray-500
        "
        aria-label="Public post notice"
      >
        This post is shared publicly on PhlyPhant
      </footer>
    </>
  );
}
