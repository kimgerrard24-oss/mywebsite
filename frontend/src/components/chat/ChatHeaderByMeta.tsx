// frontend/src/components/chat/ChatHeaderByMeta.tsx

import Link from "next/link";
import ChatReportButton from "@/components/chat/ChatReportButton";

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
          <img
            src={peer.avatarUrl ?? "/avatar-placeholder.png"}
            alt={peer.displayName ?? "User avatar"}
            className="
              h-9 w-9 rounded-full
              cursor-pointer
              hover:opacity-90
              transition
            "
            loading="lazy"
          />
        </Link>
      ) : (
        <img
          src="/avatar-placeholder.png"
          alt=""
          className="h-9 w-9 rounded-full"
        />
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
