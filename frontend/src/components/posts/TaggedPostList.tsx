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

  async function loadMore() {
    if (!cursor || loading) return;

    setLoading(true);

    try {
      const res = await getMyTaggedPosts({
        cursor,
        limit: 20,
      });

      setList((prev) => [...prev, ...res.items]);
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
            <TaggedPostItem post={post} />
          </li>
        ))}
      </ul>

      {cursor && (
        <div className="flex justify-center">
          <button
            disabled={loading}
            onClick={loadMore}
            className="rounded-md border px-4 py-2 text-sm hover:bg-gray-50 disabled:opacity-50"
          >
            {loading ? "Loading..." : "Load more"}
          </button>
        </div>
      )}
    </div>
  );
}
