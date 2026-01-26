// frontend/src/components/posts/PostRemoveMyTagButton.tsx

"use client";

import { useRemoveMyPostTag } from "@/hooks/useRemoveMyPostTag";

type Props = {
  postId: string;
  onRemoved?: () => void;
};

export default function PostRemoveMyTagButton({
  postId,
  onRemoved,
}: Props) {
  const { submit, loading } = useRemoveMyPostTag();

  async function remove() {
    try {
      await submit({ postId });
      onRemoved?.();
    } catch {
      // fail-soft
    }
  }

  return (
    <button
      type="button"
      disabled={loading}
      onClick={remove}
      className="
        text-xs
        px-2
        py-1
        rounded
        border
        text-red-600
        hover:bg-red-50
        disabled:opacity-50
      "
    >
      Remove tag
    </button>
  );
}
