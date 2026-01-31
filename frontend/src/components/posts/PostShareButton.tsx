// frontend/src/components/posts/PostShareButton.tsx

import { useState } from "react";
import ShareButton from "@/components/share/ShareButton";

type Props = {
  postId: string;
  disabled?: boolean;
};

export default function PostShareButton({
  postId,
  disabled,
}: Props) {
  const [open, setOpen] =
    useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        disabled={disabled}
        className={
          disabled
            ? "opacity-50 cursor-not-allowed"
            : "text-blue-600 hover:underline"
        }
      >
        Share
      </button>

      <ShareButton postId={postId} />

    </>
  );
}
