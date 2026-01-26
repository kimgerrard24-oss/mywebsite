// frontend/src/components/posts/TaggedPostList.tsx

"use client";

import { useState } from "react";
import TaggedPostItem from "./TaggedPostItem";
import type { MyTaggedPostItem } from "@/types/tagged-posts";
import { getMyTaggedPosts } from "@/lib/api/tagged-posts";

type Props = {
  items: MyTaggedPostItem[];
  nextCursor?: string | null;
};

export default function TaggedPostList({
  items,
  nextCursor,
}: Props) {
  const [list, setList] =
    useState<MyTaggedPostItem[]>(items);

  const [cursor, setCursor] =
    useState<string | null>(nextCursor ?? null);

  const [loading, setLoading] = useState(false);

  // =========================
  // Remove item from list (after reject/remove)
  // =========================
  function handleRemoved(postId: string) {
    setList((prev) =>
      prev.filter((p) => p.id !== postId),
    );
  }

  // =========================
  // Load more (cursor paging)
  // =========================
  async function loadMore() {
    if (!cursor || loading) return;

    setLoading(true);

    try {
      const res = await getMyTaggedPosts({
        cursor,
        limit: 20,
      });

      // ✅ avoid duplicate ids (defensive)
      setList((prev) => {
        const existing = new Set(prev.map((p) => p.id));
        const merged = res.items.filter(
          (p) => !existing.has(p.id),
        );
        return [...prev, ...merged];
      });

      setCursor(res.nextCursor);
    } catch {
      // fail-soft: do not break UX
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-3">
      <ul className="divide-y rounded-md border bg-white">
        {list.map((post) => (
          <li key={post.id}>
            <TaggedPostItem
              post={post}
              onRemoved={() => handleRemoved(post.id)}
            />
          </li>
        ))}
      </ul>

      {cursor && (
        <div className="flex justify-center">
          <button
            disabled={loading}
            onClick={loadMore}
            className="
              rounded-md
              border
              px-4
              py-2
              text-sm
              hover:bg-gray-50
              disabled:opacity-50
            "
          >
            {loading ? "Loading..." : "Load more"}
          </button>
        </div>
      )}
    </div>
  );
}
