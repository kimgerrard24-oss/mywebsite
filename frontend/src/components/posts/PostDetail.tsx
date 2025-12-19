// frontend/src/components/posts/PostDetail.tsx
import Link from "next/link";
import type { PostDetail as PostDetailType } from "@/types/post-detail";

type Props = {
  post: PostDetailType;
};

export default function PostDetail({ post }: Props) {
  return (
    <>
      <header className="mb-4 flex items-center justify-between">
        {/* ===== เพิ่มส่วนนี้ (โปรไฟล์ผู้เขียน) ===== */}
        <Link
          href={`/users/${post.author.id}`}
          className="flex items-center gap-3 hover:underline"
        >
          <img
            src={post.author.avatarUrl ?? "/images/avatar-placeholder.png"}
            alt={`${post.author.displayName} profile`}
            className="h-10 w-10 rounded-full"
          />
          <span className="font-medium">
            {post.author.displayName}
          </span>
        </Link>
        {/* ===== จบส่วนที่เพิ่ม ===== */}

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
