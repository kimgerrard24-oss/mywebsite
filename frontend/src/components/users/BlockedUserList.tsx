// frontend/src/components/users/BlockedUserList.tsx

import Image from "next/image";

type Item = {
  id: string;
  username: string;
  displayName: string | null;
  avatarUrl: string | null;
  blockedAt: string;
};

type Props = {
  items: Item[];
};

export default function BlockedUserList({
  items,
}: Props) {
  if (items.length === 0) {
    return (
      <p className="text-sm text-gray-500">
        You have not blocked anyone.
      </p>
    );
  }

  return (
    <ul
      aria-label="Blocked users"
      className="divide-y rounded border"
    >
      {items.map((u) => (
        <li
          key={u.id}
          className="flex items-center gap-3 p-3"
        >
          <div className="relative h-10 w-10 overflow-hidden rounded-full bg-gray-200">
            {u.avatarUrl && (
              <Image
                src={u.avatarUrl}
                alt={u.displayName ?? u.username}
                fill
                className="object-cover"
              />
            )}
          </div>

          <div className="flex-1">
            <p className="text-sm font-medium">
              {u.displayName ?? u.username}
            </p>
            <p className="text-xs text-gray-500">
              @{u.username}
            </p>
          </div>

          <time
            dateTime={u.blockedAt}
            className="text-xs text-gray-400"
          >
            {new Date(u.blockedAt).toLocaleDateString()}
          </time>
        </li>
      ))}
    </ul>
  );
}
