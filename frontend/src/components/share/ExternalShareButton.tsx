// frontend/src/components/share/ExternalShareButton.tsx

import { useState } from "react";
import { useCreateExternalShare } from "@/hooks/useCreateExternalShare";
import { shareExternally } from "@/utils/externalShare";

type Props = {
  postId: string;
  disabled?: boolean;
};

export default function ExternalShareButton({
  postId,
  disabled,
}: Props) {
  const {
    createExternalShare,
    loading,
  } = useCreateExternalShare();

  const [copied, setCopied] = useState(false);

  const onClick = async () => {
    if (disabled || loading) return;

    try {
      const res =
        await createExternalShare(postId);

      await shareExternally(res.url);

      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {}
  };

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || loading}
      className="
        w-full
        text-left
        px-3
        py-2
        text-sm
        rounded-md
        hover:bg-gray-100
        disabled:opacity-60
        disabled:cursor-not-allowed
      "
    >
      {copied
        ? "Link copied"
        : loading
        ? "Creating link..."
        : "Share externally"}
    </button>
  );
}
