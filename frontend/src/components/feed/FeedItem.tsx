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
      <header className="mb-2">
        <h2
          id={`post-${post.id}`}
          className="text-sm font-medium text-gray-900"
        >
          Post by {post.authorId}
        </h2>
        <time
          dateTime={post.createdAt}
          className="block text-xs text-gray-500"
        >
          {new Date(post.createdAt).toLocaleString()}
        </time>
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
