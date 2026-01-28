// frontend/src/components/posts/PostShareButton.tsx

import { useState } from "react";
import SharePostModal from "@/components/share/SharePostModal";

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

      <SharePostModal
        postId={postId}
        open={open}
        onClose={() => setOpen(false)}
      />
    </>
  );
}
