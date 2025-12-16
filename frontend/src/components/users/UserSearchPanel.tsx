// frontend/components/users/UserSearchPanel.tsx

import { useCallback, useState } from "react";
import UserSearchInput from "./UserSearchInput";
import UserSearchList from "./UserSearchList";
import type { PublicUserSearch } from "@/types/user-search";


type Props = {
  /**
   * ใช้ควบคุม UX
   * - "feed"  → quick search, lightweight
   * - "page"  → full search experience
   */
  variant?: "feed" | "page";

  /**
   * optional callback
   * ใช้กรณี feed อยากรู้ว่ามีผลลัพธ์กี่คน
   */
  onResultCountChange?: (count: number) => void;
};

export default function UserSearchPanel({
  variant = "page",
  onResultCountChange,
}: Props) {
  const [query, setQuery] = useState("");
  const [users, setUsers] = useState<PublicUserSearch[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = useCallback(async (value: string) => {
    setQuery(value);

    if (!value) {
      setUsers([]);
      onResultCountChange?.(0);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE}/users/search?query=${encodeURIComponent(
          value,
        )}`,
        {
          method: "GET",
          credentials: "include", // 🔐 HttpOnly cookie
        },
      );

      if (res.status === 429) {
        // rate-limit UX (fail-soft)
        setError("You are searching too fast. Please try again shortly.");
        return;
      }

      if (!res.ok) {
        throw new Error("Search request failed");
      }

      const data = (await res.json()) as PublicUserSearch[];
      setUsers(data);
      onResultCountChange?.(data.length);
    } catch {
      setError("Unable to search users at the moment");
    } finally {
      setLoading(false);
    }
  }, [onResultCountChange]);

  return (
    <div
      className={
        variant === "feed"
          ? "rounded-xl border border-gray-200 bg-white p-4"
          : ""
      }
    >
      <UserSearchInput onSearch={handleSearch} />

      <div className="mt-4">
        <UserSearchList
          query={query}
          loading={loading}
          error={error}
          users={users}
        />
      </div>

      {variant === "feed" && query && users.length > 0 && (
        <div className="mt-3 text-right">
          <a
            href={`/users/search?query=${encodeURIComponent(query)}`}
            className="text-sm font-medium text-blue-600 hover:underline"
          >
            View all results
          </a>
        </div>
      )}
    </div>
  );
}
