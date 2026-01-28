// frontend/src/components/posts/PostPublicDetail.tsx

import Link from "next/link";
import { renderContentWithHashtags } from "@/utils/renderContentWithHashtags";
import PostMediaViewer from "@/components/media/PostMediaViewer";
import type { PublicPostDetail } from "@/types/public-post-detail";

type Props = {
  post: PublicPostDetail;
};

export default function PostPublicDetail({ post }: Props) {
  return (
    <>
      {/* ===== Header ===== */}
      <header
        className="
          mb-3
          sm:mb-4
          flex
          items-center
          justify-between
          gap-2
        "
      >
        <Link
          href={`/users/${post.author.id}`}
          className="
            flex
            items-center
            gap-2
            hover:underline
            min-w-0
          "
        >
          <img
            src={
              post.author.avatarUrl ??
              "/images/avatar-placeholder.png"
            }
            alt={`${post.author.displayName} profile`}
            className="
              h-8
              w-8
              sm:h-10
              sm:w-10
              rounded-full
              object-cover
              flex-shrink-0
            "
            loading="lazy"
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

        <time
          dateTime={post.createdAt}
          className="
            text-xs
            sm:text-sm
            text-gray-500
            whitespace-nowrap
          "
        >
          {new Date(post.createdAt).toLocaleString()}
        </time>
      </header>

      {/* ===== Content ===== */}
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

      {/* ===== Media ===== */}
      {post.media.length > 0 && (
        <section
          className="
            mt-3
            sm:mt-4
            space-y-3
            sm:space-y-4
          "
          aria-label="Post media"
        >
          <PostMediaViewer media={post.media} />
        </section>
      )}
    </>
  );
}
