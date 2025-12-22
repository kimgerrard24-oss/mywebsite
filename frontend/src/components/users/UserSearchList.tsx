// frontend/components/users/UserSearchList.tsx

import Image from "next/image";
import Link from "next/link";
import type { PublicUserSearch } from "@/types/user-search";

type Props = {
  query: string;
  loading: boolean;
  error: string | null;
  users: PublicUserSearch[];

  /**
   * ใช้ควบคุม UX
   * - "feed" / "page" → แสดง helper + list ปกติ
   * - "navbar"        → ไม่แสดง helper / list
   */
  variant?: "feed" | "page" | "navbar";
};

export default function UserSearchList({
  query,
  loading,
  error,
  users,
  variant,
}: Props) {
  const isNavbar = variant === "navbar";

  if (!query) {
   return (
    <p
      className="
        text-xs
        sm:text-sm
        text-gray-500
      "
      role="status"
      aria-live="polite"
    >
      Start typing to search users
    </p>
  );
}

if (loading) {
  return (
    <p
      className="
        text-xs
        sm:text-sm
        text-gray-500
      "
      role="status"
      aria-live="polite"
    >
      Searching…
    </p>
  );
}

if (error) {
  return (
    <p
      className="
        text-xs
        sm:text-sm
        text-red-600
      "
      role="alert"
    >
      {error}
    </p>
  );
}

if (users.length === 0) {
  return (
    <p
      className="
        text-xs
        sm:text-sm
        text-gray-500
      "
      role="status"
      aria-live="polite"
    >
      No users found
    </p>
  );
}

return (
  <ul
    className="
      divide-y
      divide-gray-200
    "
    aria-label="User search results"
  >
    {users.map((user) => (
      <li key={user.id}>
        <Link
          href={`/users/${user.id}`}
          className="
            flex
            items-center
            gap-2
            sm:gap-3
            py-2
            sm:py-3
            px-2
            sm:px-3
            rounded-md
            hover:bg-gray-50
            transition
          "
        >
          {user.avatarUrl ? (
            <Image
              src={user.avatarUrl}
              alt={user.displayName ?? user.username}
              width={40}
              height={40}
              className="
                h-8
                w-8
                sm:h-10
                sm:w-10
                rounded-full
                object-cover
                flex-shrink-0
              "
              unoptimized
            />
          ) : (
            <div
              className="
                h-8
                w-8
                sm:h-10
                sm:w-10
                rounded-full
                bg-gray-300
                flex-shrink-0
              "
              aria-hidden="true"
            />
          )}

          <div className="min-w-0">
            <p
              className="
                text-sm
                sm:text-base
                font-medium
                truncate
              "
            >
              {user.displayName ?? user.username}
            </p>
            <p
              className="
                text-xs
                sm:text-sm
                text-gray-500
                truncate
              "
            >
              @{user.username}
            </p>
          </div>
        </Link>
      </li>
    ))}
  </ul>
);
}
