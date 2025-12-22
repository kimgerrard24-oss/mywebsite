// frontend/components/users/UserSearchPanel.tsx

import { useCallback, useState } from "react";
import UserSearchInput from "./UserSearchInput";
import UserSearchList from "./UserSearchList";
import type { PublicUserSearch } from "@/types/user-search";

type Props = {
  /**
   * ใช้ควบคุม UX
   * - "feed"    → quick search, lightweight
   * - "page"    → full search experience
   * - "navbar"  → compact search for navbar
   */
  variant?: "feed" | "page" | "navbar";

  /**
   * optional callback
   * ใช้กรณี feed อยากรู้ว่ามีผลลัพธ์กี่คน
   */
  onResultCountChange?: (count: number) => void;
};

const MIN_QUERY_LENGTH = 2;

export default function UserSearchPanel({
  variant = "page",
  onResultCountChange,
}: Props) {
  const [query, setQuery] = useState("");
  const [users, setUsers] = useState<PublicUserSearch[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = useCallback(
    async (value: string) => {
      setQuery(value);

      // reset state เมื่อยังพิมพ์ไม่พอ
      if (!value || value.trim().length < MIN_QUERY_LENGTH) {
        setUsers([]);
        setError(null);
        onResultCountChange?.(0);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE}/users/search?query=${encodeURIComponent(
            value.trim(),
          )}`,
          {
            method: "GET",
            credentials: "include",
          },
        );

        if (res.status === 429) {
          // rate-limit UX (fail-soft)
          if (variant === "page") {
            setError("You are searching too fast. Please try again shortly.");
          }
          return;
        }

        if (!res.ok) {
          throw new Error("Search request failed");
        }

        const data = (await res.json()) as PublicUserSearch[];
        setUsers(data);
        onResultCountChange?.(data.length);
      } catch {
        if (variant === "page") {
          setError("Unable to search users at the moment");
        }
      } finally {
        setLoading(false);
      }
    },
    [onResultCountChange, variant],
  );

return (
  <div
    className={
      variant === "feed"
        ? `
          w-full
          rounded-lg
          sm:rounded-xl
          border
          border-gray-200
          bg-white
          p-3
          sm:p-4
        `
        : variant === "navbar"
        ? `
          relative
          w-full
        `
        : `
          w-full
        `
    }
  >
    {/* ===== Search Input ===== */}
    <UserSearchInput
      onSearch={handleSearch}
      variant={variant}
    />

    {/* ===== Results / Helper ===== */}
    {query && (
      <div
        className={
          variant === "navbar"
            ? `
              absolute
              left-0
              right-0
              mt-2
              z-50
              rounded-md
              sm:rounded-lg
              border
              border-gray-200
              bg-white
              shadow-lg
              max-h-[60vh]
              overflow-y-auto
            `
            : `
              mt-3
              sm:mt-4
            `
        }
        aria-live="polite"
      >
        <UserSearchList
          query={query}
          loading={loading}
          error={error}
          users={users}
          variant={variant}
        />
      </div>
    )}

    {/* ===== View all (feed only) ===== */}
    {variant === "feed" && query && users.length > 0 && (
      <div
        className="
          mt-2
          sm:mt-3
          text-right
        "
      >
        <a
          href={`/users/search?query=${encodeURIComponent(query)}`}
          className="
            text-xs
            sm:text-sm
            font-medium
            text-blue-600
            hover:underline
          "
        >
          View all results
        </a>
      </div>
    )}
  </div>
);

}
