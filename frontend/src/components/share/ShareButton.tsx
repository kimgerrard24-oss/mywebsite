// frontend/src/components/share/ShareButton.tsx

import { useState } from "react";
import { useShareIntent } from "@/hooks/useShareIntent";
import ShareSheet from "./ShareSheet";

type Props = {
  postId: string;
};

export default function ShareButton({ postId }: Props) {
  const [open, setOpen] = useState(false);

  const {
    checkShareIntent,
    loading,
    result,
    reset,
  } = useShareIntent();

  const onClick = async () => {
    try {
      const res = await checkShareIntent(postId);

      if (res.canShareInternal || res.canShareExternal) {
        setOpen(true);
      } else {
        alert(getReasonMessage(res));
      }
    } catch {
      alert("ไม่สามารถตรวจสอบสิทธิ์การแชร์ได้");
    }
  };

  const close = () => {
    setOpen(false);
    reset();
  };

 return (
  <>
    <button
      type="button"
      onClick={onClick}
      disabled={loading}
      aria-haspopup="dialog"
      aria-expanded={open}
      aria-busy={loading}
      aria-live="polite"
      className="inline-flex items-center justify-center rounded-md px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium leading-none whitespace-nowrap select-none border border-gray-300 text-gray-700 transition-colors duration-150 hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 motion-reduce:transition-none disabled:opacity-60 disabled:cursor-not-allowed"
    >
      <span aria-hidden={loading}>Share to</span>
    </button>

    {result && (
      <ShareSheet
        open={open}
        onClose={close}
        postId={postId}
        intent={result}
      />
    )}
  </>
);

}

function getReasonMessage(res: {
  reason: string;
  requireFollow?: boolean;
}) {
  switch (res.reason) {
    case "BLOCKED":
      return "ไม่สามารถแชร์โพสต์จากผู้ใช้ที่คุณบล็อกหรือถูกบล็อกได้";
    case "VISIBILITY_DENIED":
      return res.requireFollow
        ? "ต้องติดตามผู้ใช้ก่อนจึงจะแชร์ได้"
        : "คุณไม่มีสิทธิ์แชร์โพสต์นี้";
    case "ACCOUNT_PRIVATE":
      return "โพสต์นี้เป็นส่วนตัว ไม่สามารถแชร์ได้";
    default:
      return "ไม่สามารถแชร์โพสต์นี้ได้";
  }
}
