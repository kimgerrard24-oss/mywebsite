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
        className="
          text-sm
          px-3
          py-1.5
          rounded-md
          border
          hover:bg-gray-50
          disabled:opacity-60
        "
      >
        Share to
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
