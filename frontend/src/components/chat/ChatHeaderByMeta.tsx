// frontend/src/components/chat/ChatHeaderByMeta.tsx

import Link from "next/link";
import ChatReportButton from "@/components/chat/ChatReportButton";
import Avatar from "@/components/ui/Avatar";

type Props = {
  meta: {
    /**
     * chat id (ใช้สำหรับ report)
     * optional เพื่อไม่กระทบการใช้งานเดิม
     */
    id?: string;

    peer: {
      id: string;
      displayName: string | null;
      avatarUrl: string | null;
    } | null;
  };
};

export default function ChatHeaderByMeta({ meta }: Props) {
  const peer = meta.peer;

  return (
    <header
      className="
        sticky top-0 z-50
        flex items-center gap-3
        border-b bg-white px-4 py-3
      "
      aria-label="Chat header"
    >
      {peer ? (
        <Link
          href={`/users/${peer.id}`}
          aria-label="Go to user profile"
          className="flex-shrink-0"
        >
          <Avatar
  avatarUrl={peer.avatarUrl}
  name={peer.displayName}
  size={36}
  className="cursor-pointer hover:opacity-90 transition"
/>

        </Link>
      ) : (
     <Avatar size={36} />

      )}

      <span className="flex-1 text-sm font-semibold truncate">
        {peer?.displayName ?? "Chat"}
      </span>

      {/* =========================
          Report Chat (fail-soft)
          ========================= */}
      {meta.id && (
        <ChatReportButton chatId={meta.id} />
      )}
    </header>
  );
}
