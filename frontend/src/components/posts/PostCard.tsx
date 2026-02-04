// frontend/src/components/posts/PostCard.tsx

import { useEffect, useState } from "react";
import type { PostFeedItem } from "@/types/post-feed";
import FeedItem from "@/components/feed/FeedItem";
import { getPostById } from "@/lib/api/posts";

type Props = {
  postId: string;
  embedded?: boolean;
};


export default function PostCard({ postId, embedded }: Props) {
  const [post, setPost] = useState<PostFeedItem | null>(null);

  useEffect(() => {
    getPostById(postId).then((res) => {
      if (res) {
        setPost({
          ...res,
          type: "post", // normalize
        } as unknown as PostFeedItem);
      }
    });
  }, [postId]);

  if (!post) return null;

  // ❗ ป้องกัน repost ซ้อน repost
  if (embedded && post.type === "repost") return null;

  return (
    <div className={embedded ? "pointer-events-auto" : ""}>
      <FeedItem post={post} />
    </div>
  );
}

