// frontend/src/components/chat/ChatHeader.tsx
import Avatar from "@/components/ui/Avatar";

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
      <Avatar
  avatarUrl={user?.avatarUrl}
  name={user?.displayName}
  size={36}
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
