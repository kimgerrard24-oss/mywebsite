// frontend/components/feed/FeedItem.tsx
import type { PostFeedItem } from '@/types/post-feed';

type Props = {
  post: PostFeedItem;
};

export default function FeedItem({ post }: Props) {
  return (
    <article
      className="rounded-lg border border-gray-200 p-4"
      aria-labelledby={`post-${post.id}`}
    >
      <header className="mb-2 flex items-center gap-3">
        {post.author.avatarUrl ? (
          <img
            src={post.author.avatarUrl}
            alt={post.author.displayName ?? 'User avatar'}
            className="h-8 w-8 rounded-full object-cover"
          />
        ) : (
          <div className="h-8 w-8 rounded-full bg-gray-300" />
        )}

        <div>
          <h2
            id={`post-${post.id}`}
            className="text-sm font-medium text-gray-900"
          >
            {post.author.displayName ?? 'Unknown user'}
          </h2>
          <time
            dateTime={post.createdAt}
            className="block text-xs text-gray-500"
          >
            {new Date(post.createdAt).toLocaleString()}
          </time>
        </div>
      </header>

      <p className="whitespace-pre-wrap text-sm text-gray-800">
        {post.content}
      </p>

      <footer className="mt-3 flex gap-4 text-xs text-gray-600">
        <span>❤️ {post.stats.likeCount}</span>
        <span>💬 {post.stats.commentCount}</span>
      </footer>
    </article>
  );
}
