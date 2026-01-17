// frontend/src/components/chat/ChatHeader.tsx

type Props = {
  user?: {
    id: string;
    displayName: string | null;
    avatarUrl: string | null;
  };
};

export default function ChatHeader({ user }: Props) {
  function getInitial(name?: string | null) {
  if (!name) return "U";
  return name.trim().charAt(0).toUpperCase();
}

  return (
    <header
      className="
        flex items-center gap-3
        h-14
        border-b
        px-4
        bg-white
      "
      aria-label="Chat header"
    >
      <div
  className="
    h-9
    w-9
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
  {user?.avatarUrl ? (
    <img
      src={user.avatarUrl}
      alt=""
      className="h-full w-full object-cover"
      referrerPolicy="no-referrer"
    />
  ) : (
    <span className="text-xs font-semibold text-gray-700">
      {getInitial(user?.displayName)}
    </span>
  )}
</div>


      <div className="flex flex-col">
        <span className="text-sm font-semibold">
          {user?.displayName ?? "User"}
        </span>
        <span className="text-xs text-gray-500">
          Private chat
        </span>
      </div>
    </header>
  );
}
