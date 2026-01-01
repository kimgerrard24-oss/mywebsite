// frontend/components/users/UserSearchPanel.tsx

import { useCallback, useState } from "react";
import UserSearchInput from "./UserSearchInput";
import UserSearchList from "./UserSearchList";
import type { PublicUserSearch } from "@/types/user-search";

// ===== New search (ADD-ON ONLY) =====
import PostSearchList from "@/components/search/PostSearchList";
import TagSearchList from "@/components/search/TagSearchList";

import { useSearchUsers } from "@/hooks/useSearchUsers";
import { useSearchPosts } from "@/hooks/useSearchPosts";
import { useSearchTags } from "@/hooks/useSearchTags";

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
  /**
   * ==================================================
   * Legacy state (GET /users/search?query=)
   * ❗ ห้ามแก้ ห้ามลบ
   * ==================================================
   */
  const [query, setQuery] = useState("");
  const [users, setUsers] = useState<PublicUserSearch[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * ==================================================
   * New search hooks (ADD-ON)
   * ==================================================
   */
  const usersSearch = useSearchUsers(); // GET /search/users
  const postsSearch = useSearchPosts(); // GET /search/posts
  const tagsSearch = useSearchTags();   // GET /search/tags

  const handleSearch = useCallback(
    async (value: string) => {
      setQuery(value);

      const keyword = value.trim();

      // ===== Legacy reset (UNCHANGED) =====
      if (!keyword || keyword.length < MIN_QUERY_LENGTH) {
        setUsers([]);
        setError(null);
        onResultCountChange?.(0);

        return;
      }

      /**
       * ==================================================
       * Legacy route (MUST WORK AS BEFORE)
       * GET /users/search?query=
       * ==================================================
       */
      setLoading(true);
      setError(null);

      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE}/users/search?query=${encodeURIComponent(
            keyword,
          )}`,
          {
            method: "GET",
            credentials: "include",
          },
        );

        if (res.status === 429) {
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

      /**
       * ==================================================
       * New routes (ADD-ON, backend authority)
       * ==================================================
       */
      usersSearch.search(keyword);
      postsSearch.search(keyword);
      tagsSearch.search(keyword);
    },
    [
      onResultCountChange,
      variant,
      usersSearch,
      postsSearch,
      tagsSearch,
    ],
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
      <UserSearchInput onSearch={handleSearch} variant={variant} />

      {/* ===== Results ===== */}
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
          {/* ===== Legacy users (UNCHANGED) ===== */}
          <UserSearchList
            query={query}
            loading={loading}
            error={error}
            users={users}
            variant={variant}
          />

          {/* ===== New: search/users ===== */}
          {(usersSearch.loading ||
            usersSearch.items.length > 0 ||
            usersSearch.error) && (
            <div className="mt-4">
              <UserSearchList
                query={query}
                loading={usersSearch.loading}
                error={usersSearch.error}
                users={usersSearch.items}
                variant={variant}
              />
            </div>
          )}

          {/* ===== New: search/posts ===== */}
          {(postsSearch.loading ||
            postsSearch.items.length > 0 ||
            postsSearch.error) && (
            <div className="mt-4">
              <PostSearchList
                items={postsSearch.items}
                loading={postsSearch.loading}
                error={postsSearch.error}
              />
            </div>
          )}

          {/* ===== New: search/tags ===== */}
          {(tagsSearch.loading ||
            tagsSearch.items.length > 0 ||
            tagsSearch.error) && (
            <div className="mt-4">
              <TagSearchList
                items={tagsSearch.items}
                loading={tagsSearch.loading}
                error={tagsSearch.error}
              />
            </div>
          )}
        </div>
      )}

      {/* ===== View all (feed only – legacy) ===== */}
      {variant === "feed" && query && users.length > 0 && (
        <div className="mt-2 sm:mt-3 text-right">
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
