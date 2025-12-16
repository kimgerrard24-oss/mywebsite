// frontend/components/users/UserSearchList.tsx
import Image from "next/image";
import Link from "next/link";
import type { PublicUserSearch } from "@/types/user-search";

type Props = {
  query: string;
  loading: boolean;
  error: string | null;
  users: PublicUserSearch[];
};

export default function UserSearchList({
  query,
  loading,
  error,
  users,
}: Props) {
  if (!query) {
    return (
      <p className="text-sm text-gray-500">
        Start typing to search users
      </p>
    );
  }

  if (loading) {
    return (
      <p className="text-sm text-gray-500">
        Searching…
      </p>
    );
  }

  if (error) {
    return (
      <p className="text-sm text-red-600">
        {error}
      </p>
    );
  }

  if (users.length === 0) {
    return (
      <p className="text-sm text-gray-500">
        No users found
      </p>
    );
  }

  return (
    <ul className="divide-y divide-gray-200">
      {users.map((user) => (
        <li key={user.id}>
          <Link
            href={`/users/${user.id}`}
            className="flex items-center gap-3 py-3 hover:bg-gray-50 transition rounded-md px-2"
          >
            {user.avatarUrl ? (
              <Image
                src={user.avatarUrl}
                alt={user.displayName ?? user.username}
                width={40}
                height={40}
                className="rounded-full object-cover"
              />
            ) : (
              <div className="h-10 w-10 rounded-full bg-gray-300" />
            )}

            <div className="min-w-0">
              <p className="text-sm font-medium truncate">
                {user.displayName ?? user.username}
              </p>
              <p className="text-xs text-gray-500 truncate">
                @{user.username}
              </p>
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}

