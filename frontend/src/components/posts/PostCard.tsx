// frontend/src/components/posts/PostCard.tsx

"use client";

import { useEffect, useState } from "react";
import { getPostById } from "@/lib/api/posts";
import type { PostDetail as PostDetailType } from "@/types/post-detail";
import PostDetail from "@/components/posts/PostDetail";

type Props = {
  postId: string;
  embedded?: boolean;
};

export default function PostCard({ postId }: Props) {
  const [post, setPost] = useState<PostDetailType | null>(null);

  useEffect(() => {
    let alive = true;

    getPostById(postId).then((res) => {
      if (!alive) return;
      setPost(res);
    });

    return () => {
      alive = false;
    };
  }, [postId]);

  if (!post) return null;

  /**
   * ✅ render "โพสต์จริง"
   * - backend = authority 100%
   * - ไม่มี normalization
   * - ไม่มีเดา field
   */
  return <PostDetail post={post} />;
}
