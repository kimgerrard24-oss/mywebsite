// frontend/components/feed/FeedList.tsx

import type { PostFeedItem } from "@/types/post-feed";
import FeedItem from "./FeedItem";

type Props = {
  items: PostFeedItem[];
  emptyText?: string;

  /** 🔑 follow state resolver */
  isFollowingAuthor: (userId: string) => boolean;

  /** 🔔 follow events */
  onFollowSuccess: (userId: string) => void;
  onUnfollowSuccess: (userId: string) => void;

  /** 🗑 optional delete handler (pass-through) */
  onPostDeleted?: (postId: string) => void;
};

export default function FeedList({
  items,
  emptyText,
  isFollowingAuthor,
  onFollowSuccess,
  onUnfollowSuccess,
  onPostDeleted,
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
        <FeedItem
          key={post.id}
          post={post}
          isFollowingAuthor={isFollowingAuthor(post.author.id)}
          onFollowSuccess={onFollowSuccess}
          onUnfollowSuccess={onUnfollowSuccess}
          onDeleted={onPostDeleted}
        />
      ))}
    </section>
  );
}
