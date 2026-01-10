// frontend/src/components/moderation/ModeratedMessagePreview.tsx

import type { ModeratedMessageDetail } from "@/types/moderation";

type Props = {
  message: ModeratedMessageDetail;
};

export default function ModeratedMessagePreview({
  message,
}: Props) {
  return (
    <article className="rounded border p-4 bg-white">
      <h1 className="text-sm font-medium mb-2">
        Message Preview
      </h1>

      {message.isDeleted ? (
        <p className="text-sm text-gray-500 italic">
          This message was removed by moderator.
        </p>
      ) : (
        <p className="text-sm text-gray-800 whitespace-pre-wrap">
          {message.content}
        </p>
      )}

      <time
        className="mt-2 block text-xs text-gray-400"
        dateTime={message.createdAt}
      >
        {new Date(message.createdAt).toLocaleString()}
      </time>
    </article>
  );
}
