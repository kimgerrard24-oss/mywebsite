// frontend/src/components/profile/ProfileUpdateComposer.tsx
"use client";

import { useEffect, useState } from "react";
import { AvatarUploader } from "./AvatarUploader";
import { useCurrentProfileMedia } from "@/hooks/useCurrentProfileMedia";
import { DeleteProfileMediaButton } from "@/components/profile/DeleteProfileMediaButton";

type Props = {
  onClose: () => void;
  currentMedia: ReturnType<typeof useCurrentProfileMedia>;
};

export default function ProfileUpdateComposer({
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

  const [caption, setCaption] = useState("");


  return (
    <section
      aria-labelledby="profile-update-heading"
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
          id="profile-update-heading"
          className="text-base font-semibold text-gray-900"
        >
          อัปเดตโปรไฟล์
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


      {/* Avatar section */}
      <section className="border rounded-lg p-3 sm:p-4 bg-gray-50">

        <div className="flex items-start gap-4">

          {/* Avatar preview */}
          <div className="relative h-20 w-20 shrink-0">

            {currentMedia.loading ? (

              <div className="h-20 w-20 rounded-full bg-gray-200 animate-pulse" />

            ) : currentMedia.data?.avatar?.url ? (

              <div className="h-20 w-20 rounded-full overflow-hidden border">

                <img
                  src={currentMedia.data.avatar.url}
                  alt="Current avatar"
                  className="h-full w-full object-cover"
                />

              </div>

            ) : (

              <div className="h-20 w-20 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 text-lg font-semibold border">
                U
              </div>

            )}

          </div>


          {/* Upload + delete + caption */}
<div className="flex flex-col gap-2 w-full">

  {/* caption input */}
  <textarea
    value={caption}
    onChange={(e) => setCaption(e.target.value)}
    placeholder="เขียนคำอธิบายเกี่ยวกับรูปโปรไฟล์..."
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
  <AvatarUploader
    currentMedia={currentMedia}
    caption={caption}
  />

  {/* delete */}
  {currentMedia.data?.avatar?.mediaId && (
    <DeleteProfileMediaButton
      mediaId={currentMedia.data.avatar.mediaId}
      onDeleted={currentMedia.refetch}
    />
  )}

</div>


        </div>

      </section>

    </section>
  );

}
