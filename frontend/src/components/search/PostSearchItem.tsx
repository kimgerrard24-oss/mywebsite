// frontend/src/components/search/PostSearchItem.tsx

import type { SearchPostItem } from '@/lib/api/search-posts';

type Props = {
  post: SearchPostItem;
};

export default function PostSearchItem({ post }: Props) {
  return (
    <article className="rounded-md border p-3 hover:bg-gray-50">
      <header className="mb-1 text-sm text-gray-600">
        {post.author.displayName ?? 'Unknown'}
      </header>

      <p className="text-sm text-gray-900 line-clamp-3">
        {post.content}
      </p>

      <time
        dateTime={post.createdAt}
        className="mt-1 block text-xs text-gray-400"
      >
        {new Date(
          post.createdAt,
        ).toLocaleString()}
      </time>
    </article>
  );
}
