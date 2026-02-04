// frontend/src/components/posts/RepostButton.tsx
import { useState } from "react";

type Props = {
  postId: string;

  /**
   * 🔁 เปิด Repost Composer (Facebook-style)
   * - parent เป็นคน decide ว่าใช้ modal / drawer / page
   */
  onOpenComposer: (params: {
    repostOfPostId: string;
  }) => void;
};

export default function RepostButton({
  postId,
  onOpenComposer,
}: Props) {
  const [opening, setOpening] = useState(false);

  function handleOpen() {
    if (opening) return;

    setOpening(true);

    try {
      onOpenComposer({
        repostOfPostId: postId,
      });
    } finally {
      // reset ทันที เพราะไม่มี async แล้ว
      setOpening(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleOpen}
      disabled={opening}
      aria-label="Repost this post"
      className="
        inline-flex
        items-center
        gap-1.5
        rounded-md
        px-2.5
        py-1.5
        text-xs
        sm:text-sm
        font-medium
        border
        border-gray-300
        hover:bg-gray-100
        focus:outline-none
        focus:ring-2
        focus:ring-blue-500
        disabled:opacity-50
        disabled:cursor-not-allowed
        transition
      "
    >
      <span aria-hidden>🔁</span>
      <span>Repost</span>
    </button>
  );
}
