// frontend/src/components/posts/RepostButton.tsx
import { useState } from "react";

type Props = {
  /**
   * ID ของโพสต์ที่แสดงใน feed
   * - ถ้าเป็นโพสต์ปกติ = post.id
   * - ถ้าเป็น repost = repost.id
   */
  postId: string;

  /**
   * 🆕 original post id (กรณี repost)
   * - Facebook-style: repost ซ้ำต้องอ้างอิงโพสต์ต้นฉบับเสมอ
   */
  originalPostId?: string;

  /**
   * 🔁 เปิด Repost Composer
   */
  onOpenComposer: (params: {
    repostOfPostId: string;
  }) => void;
};

export default function RepostButton({
  postId,
  originalPostId,
  onOpenComposer,
}: Props) {
  const [opening, setOpening] = useState(false);

  function handleOpen() {
    if (opening) return;

    setOpening(true);

    try {
      //  Facebook behavior:
      // - repost ของ repost → ใช้ originalPostId
      // - repost ของ post ปกติ → ใช้ postId
      const repostTargetId = originalPostId ?? postId;

      onOpenComposer({
        repostOfPostId: repostTargetId,
      });
    } finally {
      // reset ทันที (ไม่มี async)
      setOpening(false);
    }
  }

  return (
  <button
    type="button"
    onClick={handleOpen}
    disabled={opening}
    aria-label="Repost this post"
    aria-busy={opening}
    aria-disabled={opening}
    aria-live="polite"
    className="inline-flex items-center justify-center gap-1.5 rounded-md px-2.5 py-1.5 sm:px-3 sm:py-2 text-xs sm:text-sm font-medium leading-none whitespace-nowrap select-none border border-gray-300 text-gray-700 transition-colors duration-150 hover:bg-gray-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 motion-reduce:transition-none disabled:opacity-50 disabled:cursor-not-allowed"
  >
    <span aria-hidden>🔁</span>
    <span>Repost</span>
  </button>
);

}
