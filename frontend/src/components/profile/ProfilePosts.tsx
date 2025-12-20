// frontend/src/components/profile/ProfilePosts.tsx
import { useEffect, useState } from "react";
import FeedItem from "@/components/feed/FeedItem";
import { getUserPosts } from "@/lib/api/posts";
import type { PostFeedItem } from "@/types/post-feed";

type Props = {
  /**
   * userId ของเจ้าของโพสต์
   * - ใช้ profile.id
   */
  userId: string;

  /**
   * จำนวนโพสต์เริ่มต้น
   */
  initialLimit?: number;
};

export default function ProfilePosts({
  userId,
  initialLimit = 20,
}: Props) {
  const [posts, setPosts] = useState<PostFeedItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadPosts = async () => {
      try {
        setLoading(true);
        setError(null);

        const feed = await getUserPosts({
          userId,
          limit: initialLimit,
        });

        if (!isMounted) return;

        setPosts(feed.items ?? []);
      } catch {
        if (!isMounted) return;
        setError("ไม่สามารถโหลดโพสต์ได้ในขณะนี้");
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    void loadPosts();

    return () => {
      isMounted = false;
    };
  }, [userId, initialLimit]);

  // =========================
  // Render states
  // =========================

  if (loading) {
    return (
      <section className="mt-6" aria-label="User posts loading">
        <h2 className="mb-4 text-lg font-semibold">Posts</h2>
        <p className="text-sm text-gray-500">กำลังโหลดโพสต์...</p>
      </section>
    );
  }

  if (error) {
    return (
      <section className="mt-6" aria-label="User posts error">
        <h2 className="mb-4 text-lg font-semibold">Posts</h2>
        <p className="text-sm text-red-500">{error}</p>
      </section>
    );
  }

  if (posts.length === 0) {
    return (
      <section className="mt-6" aria-label="User posts empty">
        <h2 className="mb-4 text-lg font-semibold">Posts</h2>
        <p className="text-sm text-gray-500">
          ยังไม่มีโพสต์
        </p>
      </section>
    );
  }

  return (
    <section className="mt-6" aria-label="User posts">
      <h2 className="mb-4 text-lg font-semibold">Posts</h2>

      <div className="space-y-4">
        {posts.map((post) => (
          <FeedItem key={post.id} post={post} />
        ))}
      </div>
    </section>
  );
}
