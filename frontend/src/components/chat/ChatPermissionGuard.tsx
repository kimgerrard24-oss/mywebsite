// frontend/src/components/chat/ChatPermissionGuard.tsx
import { ReactNode } from "react";

type Props = {
  meta: any;
  children: ReactNode;
};

export default function ChatPermissionGuard({
  meta,
  children,
}: Props) {
  if (!meta) {
    return (
      <div className="p-4 text-sm text-gray-500">
        You don’t have access to this chat.
      </div>
    );
  }

  return <>{children}</>;
}
