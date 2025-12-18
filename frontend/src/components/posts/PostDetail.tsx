// frontend/src/components/posts/PostDetail.tsx
import type { PostDetail as PostDetailType } from "@/types/post-detail";

type Props = {
  post: PostDetailType;
};

export default function PostDetail({ post }: Props) {
  return (
    <>
      <header className="mb-4">
        <time
          dateTime={post.createdAt}
          className="text-sm text-gray-500"
        >
          {new Date(post.createdAt).toLocaleString()}
        </time>
      </header>

      <section className="prose max-w-none">
        <p>{post.content}</p>
      </section>

      {post.media.length > 0 && (
        <section className="mt-4 space-y-3">
          {post.media.map((m) => (
            <figure key={m.id}>
              {m.type === "image" && (
                <img
                  src={m.url}
                  alt=""
                  loading="lazy"
                  className="rounded-lg"
                />
              )}
            </figure>
          ))}
        </section>
      )}
    </>
  );
}
