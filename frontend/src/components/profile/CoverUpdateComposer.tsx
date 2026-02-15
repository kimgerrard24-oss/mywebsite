// frontend/src/components/profile/CoverUpdateComposer.tsx
"use client";

import { useEffect, useState } from "react";
import { CoverUploader } from "./CoverUploader";
import { useCurrentProfileMedia } from "@/hooks/useCurrentProfileMedia";
import { DeleteProfileMediaButton } from "@/components/profile/DeleteProfileMediaButton";

type Props = {
  onClose: () => void;
  currentMedia: ReturnType<typeof useCurrentProfileMedia>;
};

export default function CoverUpdateComposer({
  onClose,
  currentMedia,
}: Props) {

  /**
   * ESC close support
   */
  useEffect(() => {

    function handleEsc(e: KeyboardEvent) {

      if (e.key !== "Escape") return;

      const target = e.target as HTMLElement | null;

      if (
        target &&
        (
          target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable
        )
      ) {
        return;
      }

      onClose();

    }

    window.addEventListener("keydown", handleEsc);

    return () => {
      window.removeEventListener("keydown", handleEsc);
    };

  }, [onClose]);

  /**
   * caption state (same pattern as ProfileUpdateComposer)
   */
  const [caption, setCaption] = useState("");

  return (

    <section
      aria-labelledby="cover-update-heading"
      className="
        w-full
        bg-white
        border
        rounded-xl
        p-4
        sm:p-5
        space-y-4
      "
    >

      {/* Header */}
      <header className="flex items-center justify-between">

        <h2
          id="cover-update-heading"
          className="text-base font-semibold text-gray-900"
        >
          อัปเดตรูปปก
        </h2>

        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="
            inline-flex
            items-center
            justify-center
            w-8
            h-8
            rounded-full
            hover:bg-gray-100
            text-gray-500
            hover:text-gray-700
            transition
          "
        >
          ✕
        </button>

      </header>

      {/* Cover section */}
      <section className="border rounded-lg p-3 sm:p-4 bg-gray-50">

        <div className="flex flex-col gap-3">

          {/* Preview */}
          {currentMedia.loading ? (

            <div className="w-full h-40 bg-gray-200 animate-pulse rounded-md" />

          ) : currentMedia.data?.cover?.url ? (

            <div className="w-full h-40 rounded-md overflow-hidden border">

              <img
                src={currentMedia.data.cover.url}
                alt="Current cover"
                className="w-full h-full object-cover"
              />

            </div>

          ) : (

            <div className="w-full h-40 bg-gray-100 flex items-center justify-center text-gray-400 text-sm border rounded-md">
              No cover photo
            </div>

          )}

          {/* Upload + caption + delete */}
          <div className="flex flex-col gap-2 w-full">

            {/* caption input */}
            <textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="เขียนคำอธิบายเกี่ยวกับรูปปก..."
              maxLength={500}
              rows={3}
              className="
                w-full
                border
                border-gray-300
                rounded-md
                px-3
                py-2
                text-sm
                focus:outline-none
                focus:ring-2
                focus:ring-blue-500
                resize-none
                bg-white
              "
            />

            {/* uploader */}
            <CoverUploader
              currentMedia={currentMedia}
              caption={caption}
            />

            {/* delete */}
            {currentMedia.data?.cover?.mediaId && (

              <DeleteProfileMediaButton
                mediaId={currentMedia.data.cover.mediaId}
                onDeleted={currentMedia.refetch}
              />

            )}

          </div>

        </div>

      </section>

    </section>

  );

}
