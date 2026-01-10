// frontend/src/components/moderation/AppealActionPanel.tsx

import type { ModeratedMessageDetail } from "@/types/moderation";
import Link from "next/link";

type Props = {
  message: ModeratedMessageDetail;
};

export default function AppealActionPanel({
  message,
}: Props) {
  if (!message.moderation) return null;

  if (message.hasPendingAppeal) {
    return (
      <div className="rounded border p-3 bg-yellow-50 text-sm">
        Your appeal is under review.
      </div>
    );
  }

  return (
    <div className="rounded border p-3 bg-gray-50">
      <p className="text-sm mb-2">
        Moderation reason:{" "}
        <span className="font-medium">
          {message.moderation.reason}
        </span>
      </p>

      <Link
        href={`/appeals/new?targetType=CHAT_MESSAGE&targetId=${message.id}`}
        className="inline-block text-sm text-blue-600 hover:underline"
      >
        Submit an appeal
      </Link>
    </div>
  );
}
