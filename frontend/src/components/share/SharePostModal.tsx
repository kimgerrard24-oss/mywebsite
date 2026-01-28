// frontend/src/components/share/SharePostModal.tsx

import { useState } from "react";
import { useCreateShare } from "@/hooks/useCreateShare";
import ShareTargetPicker from "./ShareTargetPicker";

type Props = {
  postId: string;
  open: boolean;
  onClose: () => void;
};

export default function SharePostModal({
  postId,
  open,
  onClose,
}: Props) {
  const { submit, loading, error } =
    useCreateShare();

  const [done, setDone] =
    useState(false);

  if (!open) return null;

  const handleUser = async (
    userId: string,
  ) => {
    await submit({
      postId,
      targetUserId: userId,
    });
    setDone(true);
  };

  const handleChat = async (
    chatId: string,
  ) => {
    await submit({
      postId,
      targetChatId: chatId,
    });
    setDone(true);
  };

  return (
    <div
      className="
        fixed
        inset-0
        bg-black/40
        flex
        items-center
        justify-center
        z-50
      "
    >
      <div
        className="
          bg-white
          rounded-lg
          p-5
          w-full
          max-w-sm
        "
      >
        <h2 className="font-semibold mb-3">
          Share post
        </h2>

        {done ? (
          <div className="space-y-3">
            <p className="text-green-600">
              Shared successfully
            </p>
            <button
              onClick={onClose}
              className="
                w-full
                border
                rounded
                py-2
              "
            >
              Close
            </button>
          </div>
        ) : (
          <>
            <ShareTargetPicker
              onSelectUser={handleUser}
              onSelectChat={handleChat}
            />

            {error && (
              <p className="text-red-600 mt-2 text-sm">
                {error}
              </p>
            )}

            <button
              onClick={onClose}
              className="
                mt-4
                w-full
                border
                rounded
                py-2
              "
              disabled={loading}
            >
              Cancel
            </button>
          </>
        )}
      </div>
    </div>
  );
}
