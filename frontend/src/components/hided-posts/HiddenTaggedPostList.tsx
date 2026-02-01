// frontend/src/components/hided-posts/HiddenTaggedPostList.tsx

import type { PostFeedItem } from "@/types/post-feed";
import HiddenTaggedPostItem from "./HiddenTaggedPostItem";

type Props = {
  items: PostFeedItem[];
  onUnhide: (postId: string) => Promise<void>;
};

export default function HiddenTaggedPostList({
  items,
  onUnhide,
}: Props) {
  if (items.length === 0) {
    return (
      <p className="text-sm text-gray-500">
        ไม่มีโพสต์ที่ถูกซ่อน
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {items.map((post) => (
        <HiddenTaggedPostItem
          key={post.id}
          post={post}
          onUnhide={() => onUnhide(post.id)}
        />
      ))}
    </div>
  );
}
