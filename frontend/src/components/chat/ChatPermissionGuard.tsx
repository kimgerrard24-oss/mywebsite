// frontend/src/components/chat/ChatPermissionGuard.tsx
import { ReactNode } from "react";
import type { ChatMeta } from "@/types/chat";

type Props = {
  meta: ChatMeta | null;
  children: ReactNode;
};

export default function ChatPermissionGuard({
  meta,
  children,
}: Props) {
  /**
   * =========================
   * Backend authority
   * =========================
   */

  if (!meta) {
    return (
      <div className="p-4 text-sm text-gray-500">
        You don’t have access to this chat.
      </div>
    );
  }

  const isBlocked =
    meta.isBlocked === true ||
    meta.hasBlockedViewer === true;

  if (isBlocked) {
    return (
      <div className="p-4 text-sm text-gray-500">
        You can’t send messages in this chat.
      </div>
    );
  }

  return <>{children}</>;
}

