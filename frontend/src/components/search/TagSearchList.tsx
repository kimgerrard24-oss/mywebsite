// frontend/src/components/search/TagSearchList.tsx

import Link from "next/link";
import type { SearchTagItem } from "@/lib/api/search-tags";

type Props = {
  items: SearchTagItem[];
  loading: boolean;
  error: string | null;
};

export default function TagSearchList({
  items,
  loading,
  error,
}: Props) {
  if (loading) {
    return (
      <p
        className="text-xs sm:text-sm text-gray-500"
        role="status"
        aria-live="polite"
      >
        Searching tags…
      </p>
    );
  }

  if (error) {
    return (
      <p
        className="text-xs sm:text-sm text-red-600"
        role="alert"
      >
        {error}
      </p>
    );
  }

  if (items.length === 0) {
    return (
      <p
        className="text-xs sm:text-sm text-gray-500"
        role="status"
        aria-live="polite"
      >
        No tags found
      </p>
    );
  }

  return (
    <ul
      className="flex flex-wrap gap-2"
      aria-label="Tag search results"
    >
      {items.map((tag) => (
        <li key={tag.id}>
          <Link
            href={`/tags/${encodeURIComponent(tag.name)}`}
            className="
              inline-flex
              items-center
              gap-1
              rounded-full
              border
              border-gray-300
              px-3
              py-1
              text-xs
              sm:text-sm
              hover:bg-gray-50
              transition
            "
          >
            <span className="font-medium">
              #{tag.name}
            </span>
            <span className="text-gray-400">
              · {tag.postCount}
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
