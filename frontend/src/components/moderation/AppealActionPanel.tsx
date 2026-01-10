// frontend/src/components/moderation/AppealActionPanel.tsx
import Link from "next/link";

type Props = {
  messageId: string;

  /**
   * Source of truth comes from backend
   */
  moderation: {
    reason?: string | null;
  };

  /**
   * Backend authority:
   * true  = can submit appeal
   * false = cannot (pending / expired / not allowed)
   */
  canAppeal: boolean;
};

export default function AppealActionPanel({
  messageId,
  moderation,
  canAppeal,
}: Props) {
  if (!moderation) return null;

  if (!canAppeal) {
    return (
      <div className="rounded border p-3 bg-yellow-50 text-sm">
        Your appeal is under review or no longer available.
      </div>
    );
  }

  return (
    <div className="rounded border p-3 bg-gray-50">
      {moderation.reason && (
        <p className="text-sm mb-2">
          Moderation reason:{" "}
          <span className="font-medium">
            {moderation.reason}
          </span>
        </p>
      )}

      <Link
        href={`/appeals/new?targetType=CHAT_MESSAGE&targetId=${messageId}`}
        className="inline-block text-sm text-blue-600 hover:underline"
      >
        Submit an appeal
      </Link>
    </div>
  );
}
