// frontend/src/components/posts/PostDetail.tsx
import Link from "next/link";
import { useRouter } from "next/router";
import type { PostDetail as PostDetailType } from "@/types/post-detail";
import PostActionMenu from "@/components/posts/PostActionMenu";

type Props = {
  post: PostDetailType;
};

export default function PostDetail({ post }: Props) {
  const router = useRouter();

  return (
    <>
      {/* ================= Header ================= */}
      <header className="mb-4 flex items-center justify-between">
        {post.author && (
          <Link
            href={`/users/${post.author.id}`}
            className="flex items-center gap-3 hover:underline"
          >
            <img
              src={
                post.author.avatarUrl ??
                "/images/avatar-placeholder.png"
              }
              alt={`${post.author.displayName} profile`}
              className="h-10 w-10 rounded-full object-cover"
            />
            <span className="font-medium">
              {post.author.displayName}
            </span>
          </Link>
        )}

        <div className="flex items-center gap-2">
          <time
            dateTime={post.createdAt}
            className="text-sm text-gray-500"
          >
            {new Date(post.createdAt).toLocaleString()}
          </time>

          <PostActionMenu
            postId={post.id}
            canDelete={post.canDelete}
            canEdit={post.canDelete}
            canReport={!post.canDelete}
            onDeleted={() => {
              router.replace("/feed");
            }}
          />
        </div>
      </header>

      {/* ================= Content ================= */}
      <section className="prose max-w-none">
        <p>{post.content}</p>
      </section>

      {/* ================= Media ================= */}
      {Array.isArray(post.media) && post.media.length > 0 && (
        <section
          className="mt-4 space-y-4"
          aria-label="Post media"
        >
          {post.media.map((m) => {
            if (m.type === "image") {
              return (
                <figure key={m.id}>
                  <img
                    src={m.url}
                    alt=""
                    loading="lazy"
                    className="w-full rounded-lg"
                  />
                </figure>
              );
            }

            if (m.type === "video") {
              return (
                <figure key={m.id}>
                  <video
                    src={m.url}
                    controls
                    preload="metadata"
                    className="w-full rounded-lg"
                  />
                </figure>
              );
            }

            // fail-soft: media type ไม่รู้จัก
            return null;
          })}
        </section>
      )}
    </>
  );
}
