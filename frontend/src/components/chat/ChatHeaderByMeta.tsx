// frontend/src/components/chat/ChatHeaderByMeta.tsx

import ChatReportButton from "@/components/chat/ChatReportButton";

type Props = {
  meta: {
    /**
     * chat id (ใช้สำหรับ report)
     * optional เพื่อไม่กระทบการใช้งานเดิม
     */
    id?: string;

    peer: {
      displayName: string | null;
      avatarUrl: string | null;
    } | null;
  };
};

export default function ChatHeader({ meta }: Props) {
  return (
    <header
      className="flex items-center gap-3 border-b px-4 py-3"
      aria-label="Chat header"
    >
      <img
        src={
          meta.peer?.avatarUrl ??
          "/avatar-placeholder.png"
        }
        alt=""
        className="h-9 w-9 rounded-full"
      />

      <span className="flex-1 text-sm font-semibold">
        {meta.peer?.displayName ?? "Chat"}
      </span>

      {/* =========================
          Report Chat (NEW)
          - POST /chat/:chatId/report
          - optional / fail-soft
          ========================= */}
      {meta.id && (
        <ChatReportButton chatId={meta.id} />
      )}
    </header>
  );
}
