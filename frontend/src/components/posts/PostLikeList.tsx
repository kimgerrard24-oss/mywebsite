// frontend/src/components/posts/PostLikeList.tsx
import type { PostLike } from "@/types/post-like";

type Props = {
  likes: PostLike[];
  loading?: boolean;
  error?: string | null;
  onLoadMore?: () => void;
  hasMore?: boolean;
};

export default function PostLikeList({
  likes,
  loading,
  error,
  onLoadMore,
  hasMore,
}: Props) {
  return (
    <section aria-labelledby="post-likes-heading">
      <h2
        id="post-likes-heading"
        className="text-sm font-semibold text-gray-700 mb-3"
      >
        Liked by
      </h2>

      {error && (
        <p role="alert" className="text-sm text-red-600">
          {error}
        </p>
      )}

      <ul className="space-y-3">
        {likes.map((like) => (
          <li key={like.userId}>
            <article className="flex items-center gap-3">
              <img
                src={like.avatarUrl ?? "/avatar-placeholder.png"}
                alt=""
                className="w-8 h-8 rounded-full object-cover"
                loading="lazy"
              />
              <span className="text-sm text-gray-800">
                {like.displayName ?? "Unknown user"}
              </span>
            </article>
          </li>
        ))}
      </ul>

      {hasMore && (
        <div className="mt-4">
          <button
            type="button"
            onClick={onLoadMore}
            disabled={loading}
            className="text-sm text-blue-600 hover:underline disabled:opacity-50"
          >
            {loading ? "Loading..." : "Load more"}
          </button>
        </div>
      )}
    </section>
  );
}
