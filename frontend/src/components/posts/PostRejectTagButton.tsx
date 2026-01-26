// frontend/src/components/posts/PostRejectTagButton.tsx

"use client";

import { useRejectPostTag } from "@/hooks/useRejectPostTag";

type Props = {
  postId: string;
  tagId: string;
  onRejected?: () => void;
};

export default function PostRejectTagButton({
  postId,
  tagId,
  onRejected,
}: Props) {
  const { submit, loading } = useRejectPostTag();

  async function handleClick() {
    try {
      await submit({ postId, tagId });
      onRejected?.();
    } catch {
      // fail-soft
    }
  }

  return (
    <button
      type="button"
      disabled={loading}
      onClick={handleClick}
      className="
        text-xs
        px-2
        py-1
        rounded
        border
        disabled:opacity-60
      "
    >
      Reject
    </button>
  );
}
