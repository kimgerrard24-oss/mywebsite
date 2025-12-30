// frontend/src/components/chat/ChatHeader.tsx

type Props = {
  user?: {
    id: string;
    displayName: string | null;
    avatarUrl: string | null;
  };
};

export default function ChatHeader({ user }: Props) {
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
      <img
        src={user?.avatarUrl ?? "/avatar-placeholder.png"}
        alt=""
        className="h-9 w-9 rounded-full"
      />

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
