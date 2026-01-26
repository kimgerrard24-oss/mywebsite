// frontend/src/components/posts/PostAcceptTagButton.tsx

"use client";

import { useAcceptPostTag } from "@/hooks/useAcceptPostTag";

type Props = {
  postId: string;
  tagId: string;
  onAccepted?: () => void;
};

export default function PostAcceptTagButton({
  postId,
  tagId,
  onAccepted,
}: Props) {
  const { submit, loading } = useAcceptPostTag();

  async function onClick() {
    try {
      await submit({ postId, tagId });
      onAccepted?.();
    } catch {
      // fail-soft
    }
  }

  return (
    <button
      type="button"
      disabled={loading}
      onClick={onClick}
      className="
        text-xs
        px-2
        py-1
        rounded
        bg-blue-600
        text-white
        disabled:opacity-50
      "
    >
      Accept
    </button>
  );
}
