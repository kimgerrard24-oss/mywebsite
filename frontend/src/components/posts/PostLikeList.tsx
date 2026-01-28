// frontend/src/components/posts/PostLikeList.tsx
import Link from "next/link";
import type { PostLike } from "@/types/post-like";
import Avatar from "@/components/ui/Avatar";

type Props = {
  likes: PostLike[];
  loading?: boolean;
  error?: string | null;
  onLoadMore?: () => void;
  hasMore?: boolean;
};

export default function PostLikeList({
  likes,
  loading = false,
  error,
  onLoadMore,
  hasMore = false,
}: Props) {
  const isInitialLoading = loading && likes.length === 0;

  return (
    <section
      aria-labelledby="post-likes-heading"
      className="px-2"
    >
      <h2
        id="post-likes-heading"
        className="text-sm font-semibold text-gray-700 mb-3"
      >
        Liked by
      </h2>

      {/* ===== Error ===== */}
      {error && (
        <p role="alert" className="text-sm text-red-600 mb-2">
          {error}
        </p>
      )}

      {/* ===== Initial loading skeleton ===== */}
      {isInitialLoading && (
        <ul className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <li key={i} className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse" />
              <div className="h-3 w-32 bg-gray-200 rounded animate-pulse" />
            </li>
          ))}
        </ul>
      )}

      {/* ===== Empty state ===== */}
      {!loading && likes.length === 0 && !error && (
        <p className="text-sm text-gray-500">
          No likes yet.
        </p>
      )}

      {/* ===== Like list ===== */}
      {likes.length > 0 && (
  <ul className="space-y-3">
    {likes.map((like) => (
      <li key={like.userId}>
        <article className="flex items-center gap-3">
          <Link
            href={`/users/${like.userId}`}
            className="flex items-center gap-3 hover:underline"
          >
            <Avatar
              avatarUrl={like.avatarUrl}
              name={like.displayName}
              size={32}
            />

            <span className="text-sm text-gray-800">
              {like.displayName ?? "Unknown user"}
            </span>
          </Link>
        </article>
      </li>
    ))}
  </ul>
)}


      {/* ===== Load more ===== */}
      {hasMore && (
        <div className="mt-4 flex justify-center">
          <button
            type="button"
            onClick={onLoadMore}
            disabled={loading}
            className="
              text-sm text-blue-600 hover:underline
              disabled:opacity-50 disabled:cursor-not-allowed
            "
          >
            {loading ? "Loading..." : "Load more"}
          </button>
        </div>
      )}
    </section>
  );
}

