// frontend/components/feed/FeedList.tsx

import type { PostFeedItem } from '@/types/post-feed';
import FeedItem from './FeedItem';

type Props = {
  items: PostFeedItem[];
  emptyText?: string;
};

export default function FeedList({
  items,
  emptyText,
}: Props) {
  if (items.length === 0) {
    return (
      <p className="text-center text-sm text-gray-500">
        {emptyText ?? 'No posts yet.'}
      </p>
    );
  }

  return (
    <section className="space-y-6">
      {items.map((post) => (
        <FeedItem key={post.id} post={post} />
      ))}
    </section>
  );
}
