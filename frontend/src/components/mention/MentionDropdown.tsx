// frontend/src/components/mention/MentionDropdown.tsx

import type { MentionUser } from '@/lib/api/mention-search';

type Props = {
  items: MentionUser[];
  loading: boolean;
  onSelect: (user: MentionUser) => void;
};

export default function MentionDropdown({
  items,
  loading,
  onSelect,
}: Props) {
  if (loading) {
    return (
      <div
        role="status"
        className="rounded-md border bg-white p-2 text-sm text-gray-500 shadow"
      >
        Searching…
      </div>
    );
  }

  if (items.length === 0) return null;

  function getInitial(
  name?: string | null,
  username?: string | null,
) {
  const base =
    name?.trim() ||
    username?.trim() ||
    "U";

  return base.charAt(0).toUpperCase();
}


  return (
    <ul
      role="listbox"
      aria-label="Mention users"
      className="max-h-60 overflow-y-auto rounded-md border bg-white shadow"
    >
      {items.map((user) => {
        // ✅ fail-soft: รองรับกรณี backend ส่ง isBlocked มาในอนาคต
        const isBlocked =
          (user as { isBlocked?: boolean }).isBlocked === true;

        return (
          <li
            key={user.id}
            role="option"
            aria-selected="false"
            aria-disabled={isBlocked}
            className={`
              flex items-center gap-2 px-3 py-2
              ${isBlocked
                ? 'opacity-50 cursor-not-allowed'
                : 'cursor-pointer hover:bg-gray-100'}
            `}
            onMouseDown={(e) => {
              // ป้องกัน textarea blur
              e.preventDefault();

              // 🔒 UX guard only — backend is authority
              if (isBlocked) return;

              onSelect(user);
            }}
          >
            <div
  className="
    h-6
    w-6
    rounded-full
    overflow-hidden
    bg-gray-200
    flex
    items-center
    justify-center
    flex-shrink-0
  "
  aria-hidden
>
  {user.avatarUrl ? (
    <img
      src={user.avatarUrl}
      alt=""
      className="h-full w-full object-cover"
      loading="lazy"
      referrerPolicy="no-referrer"
    />
  ) : (
    <span className="text-[10px] font-semibold text-gray-700">
      {getInitial(user.displayName, user.username)}
    </span>
  )}
</div>


            <div className="min-w-0">
              <div className="truncate text-sm font-medium">
                {user.displayName ?? user.username}
              </div>
              <div className="truncate text-xs text-gray-500">
                @{user.username}
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
