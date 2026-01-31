// frontend/src/components/share/ShareSheet.tsx

import { useState } from "react";
import type { ShareIntentResult } from "@/lib/api/shares";
import ExternalShareButton from "./ExternalShareButton";
import ShareUserPicker from "@/components/share/ShareUserPicker";
import { api } from "@/lib/api/api";
import ChatRoomPickerModal from "@/components/chat/ChatRoomPickerModal";

type Props = {
  open: boolean;
  onClose: () => void;
  postId: string;
  intent: ShareIntentResult;
};

export default function ShareSheet({
  open,
  onClose,
  postId,
  intent,
}: Props) {
  if (!open) return null;

  const [fallbackLoading, setFallbackLoading] =
    useState(false);

  const shareUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/p/${postId}`
      : "";
  const [showPicker, setShowPicker] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showChatPicker, setShowChatPicker] =
  useState(false);

  /* =========================
     Fallback: copy / native share
     (used when ExternalShareButton fails or not supported)
     ========================= */

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      alert("คัดลอกลิงก์แล้ว");
      onClose();
    } catch {
      alert("ไม่สามารถคัดลอกลิงก์ได้");
    }
  };

  const nativeShareFallback = async () => {
    if (!shareUrl) return;

    setFallbackLoading(true);

    try {
      if (
        typeof navigator !== "undefined" &&
        "share" in navigator
      ) {
        await navigator.share({ url: shareUrl });
        onClose();
        return;
      }

      await copyLink();
    } catch {
      // fail-soft
    } finally {
      setFallbackLoading(false);
    }
  };

  return (
  <>
    {/* ===== Share Sheet Modal ===== */}
    <div
      className="
        fixed
        inset-0
        bg-black/40
        flex
        items-end
        sm:items-center
        justify-center
        z-50
      "
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Share post"
    >
      <div
        className="
          bg-white
          w-full
          sm:w-[360px]
          rounded-t-xl
          sm:rounded-xl
          p-4
          shadow-xl
        "
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="font-semibold mb-3">
          แชร์โพสต์
        </h3>

        <div className="space-y-2">
          {intent.canShareInternal && (
  <>
    {/* Share to user */}
<button
  disabled={submitting}
  className="
    w-full
    text-left
    px-3
    py-2
    border
    rounded-md
    hover:bg-gray-50
    disabled:opacity-60
  "
  onClick={() => {
    if (submitting) return; // 🛑 guard
    setShowPicker(true);
  }}
>
  ส่งให้เพื่อนใน PhlyPhant
</button>


    {/* Share to chat room */}
    <button
      disabled={submitting}
      className="
        w-full
        text-left
        px-3
        py-2
        border
        rounded-md
        hover:bg-gray-50
        disabled:opacity-60
      "
      onClick={() => setShowChatPicker(true)}
    >
      ส่งไปที่ห้องแชท
    </button>
  </>
)}


          {intent.canShareExternal && (
            <ExternalShareButton
              postId={postId}
              disabled={!intent.canShareExternal}
            />
          )}

          {intent.canShareExternal && (
            <button
              className="
                w-full
                text-left
                px-3
                py-2
                border
                rounded-md
                hover:bg-gray-50
                disabled:opacity-60
                disabled:cursor-not-allowed
              "
              disabled={fallbackLoading}
              onClick={nativeShareFallback}
            >
              {fallbackLoading
                ? "กำลังแชร์..."
                : "คัดลอกลิงก์โพสต์"}
            </button>
          )}

          {!intent.canShareInternal &&
            !intent.canShareExternal && (
              <p className="text-sm text-gray-500">
                ไม่สามารถแชร์โพสต์นี้ได้
              </p>
            )}
        </div>

        <button
          className="
            mt-4
            w-full
            text-sm
            text-gray-600
            hover:underline
          "
          onClick={onClose}
        >
          ปิด
        </button>
      </div>
    </div>

    {/* ===== User Picker Modal (Internal Share) ===== */}
    {showPicker && (
  <ShareUserPicker
    title="เลือกเพื่อนเพื่อส่งโพสต์"
    max={1}
    onClose={() => setShowPicker(false)}
    onConfirm={async ([userId]) => {
      try {
        setSubmitting(true);

        await api.post(
          "/shares",
          {
            postId,
            targetUserId: userId,
          },
          { withCredentials: true },
        );

        window.dispatchEvent(
  new CustomEvent('post:share-updated', {
    detail: { postId },
  }),
);

        setShowPicker(false);
        onClose(); // ปิด ShareSheet ด้วย
      } catch (e) {
        console.error("Internal share failed", e);
        alert("ไม่สามารถแชร์โพสต์ให้เพื่อนได้");
      } finally {
        setSubmitting(false);
      }
    }}
  />
)}


    {/* ===== Chat Room Picker Modal ===== */}
{showChatPicker && (
  <ChatRoomPickerModal
  postId={postId}
  onClose={() => setShowChatPicker(false)}
  onSuccess={(chatMessage) => {
    setShowChatPicker(false);
    onClose(); // ปิด ShareSheet

    if (chatMessage) {
      // ✅ push เข้า chat state (ผู้ส่ง)
      window.dispatchEvent(
        new CustomEvent('chat:append-message', {
          detail: chatMessage,
        }),
      );
    }
  }}
/>

)}

  </>
);

}
