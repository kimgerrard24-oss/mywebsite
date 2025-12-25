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
    <p
      className="
        w-full
        text-center
        text-xs
        sm:text-sm
        text-gray-500
        py-6
        sm:py-8
      "
      role="status"
      aria-live="polite"
    >
      {emptyText ?? "No posts yet."}
    </p>
  );
}

return (
  <section
    className="
      w-full
      space-y-4
      sm:space-y-5
      md:space-y-6
    "
    aria-label="Post feed"
  >
    {items.map((post) => (
      <FeedItem key={post.id} post={post} />
    ))}
  </section>
 );
}
