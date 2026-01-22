// frontend/src/components/feed/FeedInfiniteList.tsx

import { useEffect, useRef } from "react";
import FeedList from "./FeedList";
import { useFeed } from "@/hooks/useFeed";
import type { FeedResponse } from "@/types/post-feed";

type Props = {
  initial: FeedResponse;
};

export default function FeedInfiniteList({ initial }: Props) {
  const { items, loading, ended, loadMore } = useFeed(initial);
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (ended) return;

    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMore();
        }
      },
      { rootMargin: "200px" }
    );

    observer.observe(el);

    return () => observer.disconnect();
  }, [loadMore, ended]);

  return (
    <>
      <FeedList items={items} />

      {!ended && (
        <div
          ref={ref}
          className="h-10"
          aria-hidden
        />
      )}

      {loading && (
        <p className="text-center text-xs text-gray-400 py-4">
          Loading…
        </p>
      )}
    </>
  );
}
