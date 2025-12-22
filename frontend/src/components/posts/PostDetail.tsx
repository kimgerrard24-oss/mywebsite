// frontend/src/components/posts/PostDetail.tsx
import Link from "next/link";
import { useRouter } from "next/router";
import type { PostDetail as PostDetailType } from "@/types/post-detail";
import PostActionMenu from "@/components/posts/PostActionMenu";
import { renderContentWithHashtags } from "@/utils/renderContentWithHashtags";

type Props = {
  post: PostDetailType;
};

export default function PostDetail({ post }: Props) {
  const router = useRouter();

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
      {post.author && (
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
          <img
            src={
              post.author.avatarUrl ??
              '/images/avatar-placeholder.png'
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
      )}

      <div
        className="
          flex
          items-center
          gap-1.5
          sm:gap-2
          flex-shrink-0
        "
      >
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

        <PostActionMenu
          postId={post.id}
          canDelete={post.canDelete}
          canEdit={post.canDelete}
          canReport={!post.canDelete}
          onDeleted={() => {
            router.replace('/feed');
          }}
        />
      </div>
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
          // ✅ FIX: รองรับ backend ใหม่ (url) + backward-safe (cdnUrl)
          const src = m.cdnUrl ?? m.url;

          if (m.type === 'image') {
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

          if (m.type === 'video') {
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

          // fail-soft
          return null;
        })}
      </section>
    )}
  </>
);

}
