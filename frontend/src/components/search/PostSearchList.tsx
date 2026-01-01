// frontend/src/components/search/PostSearchList.tsx

import PostSearchItem from './PostSearchItem';
import type { SearchPostItem } from '@/lib/api/search-posts';

type Props = {
  items: SearchPostItem[];
  loading: boolean;
  error: string | null;
};

export default function PostSearchList({
  items,
  loading,
  error,
}: Props) {
  if (loading) {
    return (
      <p className="text-sm text-gray-500">
        Searching…
      </p>
    );
  }

  if (error) {
    return (
      <p className="text-sm text-red-500">
        {error}
      </p>
    );
  }

  if (items.length === 0) {
    return (
      <p className="text-sm text-gray-400">
        No posts found
      </p>
    );
  }

  return (
    <ul className="space-y-3">
      {items.map((post) => (
        <li key={post.id}>
          <PostSearchItem post={post} />
        </li>
      ))}
    </ul>
  );
}
